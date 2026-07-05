import { z } from "zod";

export enum Persona {
  PIYUSH = "piyush",
  HITESH = "hitesh",
}

export const personaSchema = z.enum(["piyush", "hitesh"]);
