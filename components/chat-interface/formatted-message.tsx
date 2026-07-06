import * as React from "react";
import { Play, ListVideo, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import hljs from "highlight.js";
import { z } from "zod";
import "highlight.js/styles/github-dark.css";

const YouTubeCardSchema = z.object({
  type: z.enum(["Video", "Playlist"]),
  title: z.string(),
  url: z.string(),
  channel: z.string(),
  thumbnail: z.string().optional(),
  description: z.string().optional().default(""),
});

type YouTubeCard = z.infer<typeof YouTubeCardSchema>;

function tryParseYouTubeCards(code: string): YouTubeCard[] | null {
  try {
    const parsed = JSON.parse(code.trim());
    const result = z.array(YouTubeCardSchema).nonempty().safeParse(parsed);
    if (result.success) {
      return result.data;
    }
  } catch (e) {
    // Ignore and fall back to regular code block rendering
  }
  return null;
}

function YouTubeCardComponent({ card }: { card: YouTubeCard }) {
  const isPlaylist = card.type === "Playlist";
  const isPiyush = card.channel.toLowerCase().includes("piyush");
  
  return (
    <a
      href={card.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block my-3 border border-border/40 bg-card/30 hover:bg-accent/25 rounded-xl overflow-hidden hover:-translate-y-0.5 hover:shadow-xs hover:border-border/60 transition-all duration-300 max-w-2xl"
    >
      <div className="flex flex-row p-2.5 gap-3.5 items-center">
        {/* Thumbnail / Left side */}
        <div className="relative shrink-0 w-28 h-16 sm:w-36 sm:h-20 aspect-video bg-muted flex items-center justify-center overflow-hidden rounded-lg border border-border/30">
          {card.thumbnail ? (
            <img
              src={card.thumbnail}
              alt={card.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-tr from-red-600/20 to-rose-600/5 flex items-center justify-center">
              {isPlaylist ? (
                <ListVideo className="text-red-500/80" size={24} />
              ) : (
                <Play className="text-red-500/80 fill-red-500/40 ml-0.5" size={24} />
              )}
            </div>
          )}

          {/* Hover play overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white shadow-md transform scale-75 group-hover:scale-100 transition-transform duration-300">
              {isPlaylist ? <ListVideo size={14} /> : <Play className="fill-white ml-0.5" size={14} />}
            </div>
          </div>

          {/* Playlist count or video tag on top of image */}
          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[8px] font-bold text-white bg-black/75 rounded-xs select-none tracking-wider leading-none">
            {isPlaylist ? "PLAYLIST" : "VIDEO"}
          </div>
        </div>

        {/* Details / Right side */}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          {/* Header info */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0",
              isPiyush ? "bg-blue-500" : "bg-rose-500"
            )} />
            <span className="text-[10px] font-semibold text-muted-foreground truncate uppercase tracking-wider">
              {card.channel}
            </span>
          </div>

          {/* Title */}
          <h4 className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 sm:line-clamp-2 leading-tight">
            {card.title}
          </h4>

          {/* Description */}
          {card.description && (
            <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2 mt-0.5 leading-snug font-normal">
              {card.description}
            </p>
          )}

          {/* CTA Link */}
          <div className="mt-1.5 flex items-center gap-1 text-[10px] font-extrabold text-primary opacity-90 group-hover:opacity-100 transition-opacity">
            <span>{isPlaylist ? "View Playlist" : "Watch Video"}</span>
            <ExternalLink size={10} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </a>
  );
}

const markdownComponents = {
  h1: ({ children }: any) => (
    <h1 className="text-xl font-bold mt-4 mb-2 text-foreground first:mt-0">{children}</h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-lg font-semibold mt-3 mb-1.5 text-foreground first:mt-0">{children}</h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-base font-semibold mt-2 mb-1 text-foreground first:mt-0">{children}</h3>
  ),
  p: ({ children }: any) => (
    <p className="leading-relaxed text-sm my-1.5 last:mb-0 text-foreground/90">{children}</p>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc pl-5 my-2 space-y-1 text-sm text-foreground/90">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal pl-5 my-2 space-y-1 text-sm text-foreground/90">{children}</ol>
  ),
  li: ({ children }: any) => (
    <li className="leading-relaxed">{children}</li>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-primary/30 pl-4 my-3 italic text-muted-foreground bg-muted/20 py-1 rounded-r">
      {children}
    </blockquote>
  ),
  table: ({ children }: any) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-border/40">
      <table className="w-full text-xs text-left border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-muted text-muted-foreground uppercase font-bold text-[10px] tracking-wider border-b border-border/40">
      {children}
    </thead>
  ),
  tbody: ({ children }: any) => (
    <tbody className="divide-y divide-border/30">{children}</tbody>
  ),
  tr: ({ children }: any) => (
    <tr className="hover:bg-muted/10 transition-colors">{children}</tr>
  ),
  th: ({ children }: any) => (
    <th className="px-4 py-2 font-semibold">{children}</th>
  ),
  td: ({ children }: any) => (
    <td className="px-4 py-2 text-foreground/80">{children}</td>
  ),
  strong: ({ children }: any) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  a: ({ href, children }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline inline-flex items-center gap-0.5 font-medium transition-colors"
    >
      {children}
    </a>
  ),
  code({ node, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || "");
    const inline = !match;

    if (inline) {
      return (
        <code
          className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono border border-border/40 text-rose-500 dark:text-rose-400 font-semibold"
          {...props}
        >
          {children}
        </code>
      );
    }

    const language = match[1];
    const codeContent = String(children).replace(/\n$/, "");

    if (language.toLowerCase() === "json") {
      const cards = tryParseYouTubeCards(codeContent);
      if (cards) {
        return (
          <div className="flex flex-col gap-2 my-2">
            {cards.map((card, cardIdx) => (
              <YouTubeCardComponent key={cardIdx} card={card} />
            ))}
          </div>
        );
      }
    }

    let highlightedHtml = codeContent;
    try {
      if (language && hljs.getLanguage(language)) {
        highlightedHtml = hljs.highlight(codeContent, { language }).value;
      } else {
        highlightedHtml = hljs.highlightAuto(codeContent).value;
      }
    } catch (e) {
      // Fallback
    }

    return (
      <div className="my-3 rounded-lg overflow-hidden border border-border/50 bg-[#0d1117] font-mono text-xs shadow-xs">
        {language && (
          <div className="bg-zinc-900 px-4 py-1.5 text-[9px] font-bold text-zinc-400 uppercase border-b border-zinc-800 tracking-wider select-none">
            {language}
          </div>
        )}
        <pre className="p-4 overflow-x-auto select-all text-zinc-300 leading-relaxed">
          <code
            className="hljs"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>
      </div>
    );
  },
};

interface FormattedMessageProps {
  content: string;
}

export function FormattedMessage({ content }: FormattedMessageProps) {
  // Check if there is an unclosed ```json code block containing cards
  const occurrences = (content.match(/```/g) || []).length;
  const isStreamingJSON = occurrences % 2 !== 0 && content.includes("```json");

  let cleanContent = content;
  let showLoader = false;

  if (isStreamingJSON) {
    const jsonStartIdx = content.lastIndexOf("```json");
    if (jsonStartIdx !== -1) {
      // Hide the raw JSON data block from displaying during streaming
      cleanContent = content.slice(0, jsonStartIdx);
      showLoader = true;
    }
  }

  return (
    <div className="space-y-1.5">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {cleanContent}
      </ReactMarkdown>

      {/* Pulsing skeleton loader representing incoming card data */}
      {showLoader && (
        <div className="my-3 border border-border/40 bg-card/30 rounded-xl p-2.5 max-w-2xl animate-pulse select-none">
          <div className="flex flex-row gap-3.5 items-center">
            {/* Thumbnail skeleton */}
            <div className="shrink-0 w-28 h-16 sm:w-36 sm:h-20 bg-muted rounded-lg" />
            {/* Details skeleton */}
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-3 bg-muted rounded-sm w-20" />
              <div className="h-4 bg-muted rounded-sm w-4/5" />
              <div className="h-3 bg-muted rounded-sm w-2/3" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

