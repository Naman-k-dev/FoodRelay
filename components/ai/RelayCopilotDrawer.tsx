"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  HelpCircle,
  ExternalLink,
  Bot,
  User,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import { CopilotResult } from "@/lib/schemas/copilot";

interface RelayCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contextData: any;
}

const PRESET_QUESTIONS = [
  "Which donations currently need coordinator attention?",
  "Why are some donations held in the safety queue?",
  "Which recipient shelters have the highest outstanding demand?",
  "Summarize today's surplus food rescue operations.",
];

export function RelayCopilotDrawer({
  isOpen,
  onClose,
  contextData,
}: RelayCopilotDrawerProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ sender: "user" | "copilot"; text: string; data?: CopilotResult }>
  >([
    {
      sender: "copilot",
      text: "Relay Copilot initialized. I inspect live donation queues, explain allocation decisions, and verify recipient demand grounded in your local database and Graftcode MCP tools.",
    },
  ]);

  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAsk = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || isLoading) return;

    setMessages((prev) => [...prev, { sender: "user", text: q }]);
    setQuery("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          contextData: {
            donations: contextData.donations || [],
            recipients: contextData.recipients || [],
            allocations: contextData.allocations || [],
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Copilot responded with HTTP ${res.status}`);
      }

      const result: CopilotResult = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: "copilot",
          text: result.summary,
          data: result,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "copilot",
          text: `Error analyzing query: ${err.message}. Please check connection or retry.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="w-full max-w-md bg-panel h-full shadow-elevation border-l border-studio-border flex flex-col">
        {/* Drawer Header */}
        <div className="p-3.5 border-b border-studio-border flex items-center justify-between bg-canvas-subtle">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-studio-indigo text-white flex items-center justify-center">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-heading font-semibold text-xs text-studio-text">
                  Relay Copilot
                </h3>
                <span className="text-[9px] font-mono font-medium px-1 py-0.2 rounded bg-studio-indigo/10 text-studio-indigo border border-studio-indigo/20">
                  GEMINI + MCP
                </span>
              </div>
              <p className="text-[10px] text-studio-text-muted">
                Operational grounding across local records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-studio-text-muted hover:text-studio-text hover:bg-panel transition"
            aria-label="Close Copilot"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${
                m.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.sender === "copilot" && (
                <div className="w-5 h-5 rounded bg-studio-indigo text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3 h-3" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded p-2.5 text-2xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-studio-obsidian dark:bg-studio-graphite text-white font-medium"
                    : "bg-canvas-subtle border border-studio-border text-studio-text"
                }`}
              >
                <p>{m.text}</p>

                {/* Structured Insights & Suggestions if returned by API */}
                {m.data?.actionableSuggestions && m.data.actionableSuggestions.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-studio-border/60 space-y-1">
                    <span className="text-[10px] font-mono font-semibold text-studio-text-muted uppercase">
                      Recommended Next Actions:
                    </span>
                    {m.data.actionableSuggestions.map((suggestion, aIdx) => (
                      <div
                        key={aIdx}
                        className="p-1 rounded bg-panel border border-studio-border text-[11px] text-studio-text"
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 items-center text-studio-text-muted text-2xs">
              <div className="w-4 h-4 border-2 border-studio-indigo border-t-transparent rounded-full animate-spin" />
              <span>Analyzing records with Gemini reasoning...</span>
            </div>
          )}
        </div>

        {/* Quick Presets */}
        <div className="px-3.5 py-2 border-t border-studio-border bg-canvas-subtle">
          <div className="text-[10px] font-mono text-studio-text-muted uppercase mb-1.5">
            Quick Queries
          </div>
          <div className="flex flex-wrap gap-1">
            {PRESET_QUESTIONS.map((q, i) => (
              <button
                key={i}
                disabled={isLoading}
                onClick={() => handleAsk(q)}
                className="text-[11px] px-2 py-0.5 rounded bg-panel border border-studio-border text-studio-text-secondary hover:text-studio-text hover:border-studio-tangerine transition text-left truncate max-w-full disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Composer */}
        <div className="p-3 border-t border-studio-border bg-panel">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk(query);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask Copilot about donations, safety, or shelters..."
              disabled={isLoading}
              className="flex-1 bg-canvas-subtle border border-studio-border rounded px-2.5 py-1.5 text-xs text-studio-text placeholder:text-studio-text-muted focus:outline-none focus:border-studio-indigo"
            />
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="p-1.5 rounded bg-studio-indigo text-white hover:bg-studio-indigo-hover disabled:opacity-40 transition"
              aria-label="Send query"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
