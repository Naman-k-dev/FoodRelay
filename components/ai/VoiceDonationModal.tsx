"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Sparkles, X, CheckCircle2, RotateCcw } from "lucide-react";

interface VoiceDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmTranscript: (transcript: string) => void;
}

export function VoiceDonationModal({
  isOpen,
  onClose,
  onConfirmTranscript,
}: VoiceDonationModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [language, setLanguage] = useState<"en-IN" | "hi-IN">("en-IN");
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      }
    }
  }, []);

  if (!isOpen) return null;

  const startRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser speech recognition is not supported in this browser. Please type your message.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + " ";
        }
        setTranscript(currentTranscript.trim());
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        stopRecording();
      };

      recognition.onend = () => {
        setIsRecording(false);
        clearInterval(timerRef.current);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      alert(`Microphone error: ${err.message || "Failed to start speech recognition"}`);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
    clearInterval(timerRef.current);
  };

  const handleUseTranscript = () => {
    if (!transcript.trim()) {
      alert("Please record or type a donation description first.");
      return;
    }
    onConfirmTranscript(transcript);
    onClose();
  };

  const handlePresetSample = (sample: string) => {
    setTranscript(sample);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-elevation border border-gray-100 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-mint rounded-2xl text-forest">
              <Mic className="w-5 h-5 text-emerald" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-forest">
                Voice Donation Intake
              </h3>
              <p className="text-xs text-charcoal-muted">
                Describe surplus food in spoken English, Hindi, or Hinglish
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selection */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-charcoal">Speech Language:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage("en-IN")}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                language === "en-IN"
                  ? "bg-forest text-white shadow-subtle"
                  : "bg-cream text-charcoal hover:bg-cream-dark"
              }`}
            >
              English / Hinglish (India)
            </button>
            <button
              type="button"
              onClick={() => setLanguage("hi-IN")}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                language === "hi-IN"
                  ? "bg-forest text-white shadow-subtle"
                  : "bg-cream text-charcoal hover:bg-cream-dark"
              }`}
            >
              हिन्दी (Hindi)
            </button>
          </div>
        </div>

        {/* Microphone Recording Orb */}
        <div className="flex flex-col items-center justify-center py-6 bg-cream/50 rounded-2xl border border-gray-100 space-y-3">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition shadow-elevation ${
              isRecording
                ? "bg-crimson text-white animate-pulse ring-4 ring-crimson/30"
                : "bg-forest text-mint hover:bg-forest-light hover:scale-105"
            }`}
          >
            {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>

          <div className="text-center">
            <span className="text-xs font-bold text-forest block">
              {isRecording ? `Recording... (${recordingSeconds}s / 60s)` : "Tap to Speak"}
            </span>
            <span className="text-[11px] text-charcoal-muted">
              {isRecording ? "Tap to finish speaking" : "Describe portions, location, and packaging"}
            </span>
          </div>
        </div>

        {/* Transcript Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-charcoal">Voice Transcript (Editable):</label>
            <button
              type="button"
              onClick={() =>
                handlePresetSample(
                  "We have 150 portions of vegetable biryani and raita from our conference center in Sector 62 Noida, cooked at 1 PM and packed in sealed containers. Pickup needed by 3:30 PM."
                )
              }
              className="text-[11px] text-emerald hover:underline font-semibold"
            >
              ✦ Load Sample Voice Transcript
            </button>
          </div>
          <textarea
            rows={3}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your spoken words will appear here in real time. You can edit them before extraction..."
            className="w-full p-3 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald/40 bg-white"
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal bg-white border border-gray-200 hover:bg-cream transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUseTranscript}
            disabled={!transcript.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-subtle transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-mint" />
            Transfer to AI Smart Intake
          </button>
        </div>
      </div>
    </div>
  );
}
