import { GoogleGenAI } from "@google/genai";

export interface AIClientOptions {
  systemInstruction?: string;
  prompt: string;
  inlineMedia?: {
    data: string; // base64
    mimeType: string;
  };
  timeoutMs?: number;
  temperature?: number;
}

export interface AIClientResult {
  text: string;
  model: string;
  executionTimeMs: number;
}

/**
 * Standardized Centralized Server-Side Gemini AI Client.
 * Implements candidate model cascades, request timeouts, error normalization,
 * and zero credential leakage.
 */
export async function executeGeminiRequest(options: AIClientOptions): Promise<AIClientResult> {
  const startTime = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;
  const configuredModel = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  const featureEnabled = process.env.AI_ENABLED !== "false";
  const timeoutMs = options.timeoutMs || parseInt(process.env.AI_REQUEST_TIMEOUT_MS || "15000", 10);

  if (!featureEnabled) {
    throw new Error("AI features are disabled via AI_ENABLED environment variable.");
  }

  if (!apiKey || apiKey.trim() === "" || apiKey === "your-gemini-api-key-here") {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const modelsToTry = Array.from(
    new Set([configuredModel, "gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.8-flash"])
  );

  const ai = new GoogleGenAI({ apiKey });
  let lastError: any = null;

  for (const modelCandidate of modelsToTry) {
    try {
      const contents: any[] = [];

      if (options.inlineMedia) {
        contents.push({
          inlineData: {
            data: options.inlineMedia.data,
            mimeType: options.inlineMedia.mimeType,
          },
        });
      }

      contents.push(options.prompt);

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout (${timeoutMs}ms) calling ${modelCandidate}`)), timeoutMs)
      );

      const callPromise = ai.models.generateContent({
        model: modelCandidate,
        contents,
        config: {
          systemInstruction: options.systemInstruction,
          responseMimeType: "application/json",
          temperature: options.temperature ?? 0.1,
        },
      });

      const response = (await Promise.race([callPromise, timeoutPromise])) as any;
      const text = response.text?.trim() || "";

      if (!text) {
        throw new Error("Empty response received from Gemini.");
      }

      return {
        text,
        model: modelCandidate,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      lastError = err;
      // If error is 404 (model not found/available), continue to next model candidate
      if (err.message?.includes("404") || err.message?.includes("not found")) {
        continue;
      }
      // If error is timeout or quota, also attempt next candidate once
      if (err.message?.includes("Timeout") || err.status === 429) {
        continue;
      }
      // Otherwise stop early on fatal errors like auth invalid key
      break;
    }
  }

  throw new Error(
    `Gemini request failed: ${lastError?.message || "Unknown API error"}. Models tried: ${modelsToTry.join(", ")}`
  );
}
