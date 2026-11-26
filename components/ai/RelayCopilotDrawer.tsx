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
      text: "Hello Coordinator! I am Relay Copilot. I can inspect current donation queues, explain allocation decisions, and check recipient demand grounded strictly in your live records.",
    },
  ]);

  if (!isOpen) return null;

  const handleAsk = async (questionText: string) => {
    const q = questionText.trim();
    if (!q) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text: q }]);
    setQuery("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          context: contextData,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Copilot query failed");

      const copilotData: CopilotResult = data.data;
      setMessages((prev) => [
        ...prev,
        {
          sender: "copilot",
          text: copilotData.answer,
          data: copilotData,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "copilot",
          text: `Apologies, I encountered an error: ${err.message || "Failed to reach copilot service"}.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-elevation border-l border-gray-100 flex flex-col justify-between">
      {/* Top Bar */}
      <div className="p-4 bg-forest text-white flex items-center justify-between border-b border-forest-light/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald text-mint">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-extrabold text-sm">Relay Copilot</h3>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-mint text-forest uppercase">
                Grounded AI
              </span>
            </div>
            <p className="text-[10px] text-cream/70">Read-only operational assistant</p>
          </div>
        </div>

        <button onClick={onClose} className="p-1 rounded-lg hover:bg-forest-light text-cream/80">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Message History */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto text-xs">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "copilot" && (
              <div className="w-6 h-6 rounded-full bg-forest text-mint flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                msg.sender === "user"
                  ? "bg-forest text-white"
                  : "bg-cream text-charcoal border border-gray-100"
              }`}
            >
              <p>{msg.text}</p>

              {/* Clickable Reference Pills */}
              {msg.data?.referencedRecordIds && msg.data.referencedRecordIds.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200/50 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-bold text-forest">Referenced Records:</span>
                  {msg.data.referencedRecordIds.map((id) => (
                    <Link
                      key={id}
                      href={
                        id.startsWith("don-")
                          ? `/donations?highlight=${id}`
                          : id.startsWith("rec-")
                          ? `/recipients?highlight=${id}`
                          : `/dispatch`
                      }
                      onClick={onClose}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-emerald/30 text-emerald hover:bg-mint transition inline-flex items-center gap-1"
                    >
                      {id} <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-charcoal-muted">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-forest" />
            <span>Consulting application records...</span>
          </div>
        )}
      </div>

      {/* Presets & Input Footer */}
      <div className="p-4 border-t border-gray-100 bg-cream/30 space-y-3">
        {/* Quick Question Chips */}
        <div>
          <span className="text-[10px] font-bold text-charcoal-muted uppercase tracking-wider block mb-1">
            Suggested Operational Queries:
          </span>
          <div className="flex flex-wrap gap-1">
            {PRESET_QUESTIONS.map((pq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAsk(pq)}
                className="text-[10px] text-left px-2 py-1 rounded-lg bg-white hover:bg-cream border border-gray-200 text-charcoal font-medium transition"
              >
                ✦ {pq}
              </button>
            ))}
          </div>
        </div>

        {/* Input Field */}
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
            placeholder="Ask Copilot about donations, recipients..."
            className="flex-1 p-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald/40 bg-white"
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="p-2 rounded-xl bg-forest hover:bg-forest-light text-white transition disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
