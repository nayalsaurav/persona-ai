import "dotenv/config";
import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { Persona } from "@/validation/persona";
import { getSystemPrompt } from "./personas";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const PERSONA_CHANNELS: Record<Persona, { handle: string; id: string }> = {
  piyush: { handle: "@piyushgargdev", id: "UCf9T51_FmMlfhiGpoes0yFA" },
  hitesh: { handle: "@ChaiAurCode", id: "UCNQ6FEtztATuaVhZKCY28Yw" },
};

async function searchYouTube(persona: Persona, query: string): Promise<string> {
  if (!query || !query.trim()) {
    return "Error: no search query was provided.";
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return "YouTube API Key is missing. Please configure YOUTUBE_API_KEY in the environment.";
  }

  const channel = PERSONA_CHANNELS[persona];
  if (!channel) {
    return `Error: no YouTube channel configured for persona "${persona}".`;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channel.id}&type=video,playlist&order=relevance&maxResults=5&q=${encodeURIComponent(
        query
      )}&key=${apiKey}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("YouTube search error:", errorText);
      return "Failed to fetch videos from YouTube.";
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      return `No videos or playlists found on ${channel.handle} for "${query}".`;
    }

    const results = data.items.map((item: any) => {
      const isPlaylist = item.id?.kind === "youtube#playlist";
      const id = isPlaylist ? item.id.playlistId : item.id.videoId;
      const title = item.snippet.title;
      const description = item.snippet.description;
      const channelTitle = item.snippet.channelTitle;
      const url = isPlaylist
        ? `https://www.youtube.com/playlist?list=${id}`
        : `https://www.youtube.com/watch?v=${id}`;

      return `Type: ${isPlaylist ? "Playlist" : "Video"}\nTitle: ${title}\nLink: ${url}\nChannel: ${channelTitle}\nThumbnail: ${item.snippet.thumbnails?.medium?.url || ""}\nDescription: ${description}\n---`;
    });

    return results.join("\n");
  } catch (error) {
    console.error("searchYouTube error:", error);
    return `An error occurred while searching ${channel.handle}'s channel.`;
  }
}

const tools = [
  {
    type: "function" as const,
    function: {
      name: "searchYouTube",
      description:
        "Searches this persona's own YouTube channel for videos or playlists matching a query. Always use this instead of guessing a video title or link — never invent one.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query, e.g., 'React hooks tutorial'.",
          },
        },
        required: ["query"],
      },
    },
  },
];

export async function* runAgent(
  persona: Persona,
  history: { role: "user" | "assistant" | "developer" | "system"; content: string }[]
): AsyncGenerator<string, string, unknown> {
  const systemPrompt = getSystemPrompt(persona);
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...history.map((msg) => ({
      role: msg.role === "developer" ? "system" : msg.role,
      content: msg.content,
    }) as ChatCompletionMessageParam),
  ];

  let iterations = 0;
  const maxIterations = 5;

  while (iterations < maxIterations) {
    iterations++;

    let stream;
    try {
      stream = await client.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: messages,
        tools: tools,
        stream: true,
      });
    } catch (err) {
      console.error("[Agent] API call failed:", err);
      yield "Sorry, I hit an error talking to the model. Please try again.";
      return "Sorry, I hit an error talking to the model. Please try again.";
    }

    let assistantContent = "";
    const toolCalls: any[] = [];

    for await (const chunk of stream) {
      const choice = chunk.choices[0];
      const delta = choice?.delta;
      if (delta?.content) {
        assistantContent += delta.content;
        yield delta.content;
      }
      if (delta?.tool_calls) {
        for (const tc of delta.tool_calls) {
          if (!toolCalls[tc.index]) {
            toolCalls[tc.index] = {
              id: tc.id,
              type: tc.type || "function",
              function: { name: "", arguments: "" },
            };
          }
          if (tc.id) {
            toolCalls[tc.index].id = tc.id;
          }
          if (tc.function?.name) {
            toolCalls[tc.index].function.name += tc.function.name;
          }
          if (tc.function?.arguments) {
            toolCalls[tc.index].function.arguments += tc.function.arguments;
          }
        }
      }
    }

    const activeToolCalls = toolCalls.filter(Boolean);

    const assistantMessage = {
      role: "assistant" as const,
      content: assistantContent || null,
      tool_calls: activeToolCalls.length > 0 ? activeToolCalls.map((tc) => ({
        id: tc.id,
        type: tc.type,
        function: {
          name: tc.function.name,
          arguments: tc.function.arguments,
        },
      })) : undefined,
    } as ChatCompletionMessageParam;

    messages.push(assistantMessage);

    if (activeToolCalls.length > 0) {
      for (const toolCall of activeToolCalls) {
        if (toolCall.type === "function") {
          if (toolCall.function.name === "searchYouTube") {
            let query = "";
            try {
              const args = JSON.parse(toolCall.function.arguments);
              query = args.query || "";
            } catch (e) {
              console.error("Failed to parse tool arguments:", toolCall.function.arguments);
            }

            const result = await searchYouTube(persona, query);
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: result,
            });
          } else {
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: `Error: Unknown tool "${toolCall.function.name}"`,
            });
          }
        } else {
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: `Error: Unsupported tool type "${toolCall.type}"`,
          });
        }
      }
      continue;
    }

    if (assistantContent) {
      return assistantContent;
    }
    console.warn("[Agent] Model returned empty content with no tool call.");
    return "Sorry, I couldn't generate a response. Please rephrase your question.";
  }

  return "I wasn't able to finish resolving that within the allowed number of tool calls. Could you rephrase or simplify the question?";
}