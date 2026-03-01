"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { useCallStore } from "@/stores/call-store";

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

// Browser Speech API types (not in TS lib by default)
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface UseTranscriptionOptions {
  speakerId: string;
  speakerName: string;
  language?: string;
  onEntry?: (entry: {
    speaker_id: string;
    speaker_name: string;
    text: string;
    timestamp_ms: number;
  }) => void;
}

export function useTranscription({
  speakerId,
  speakerName,
  language = "fr-FR",
  onEntry,
}: UseTranscriptionOptions) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldRestartRef = useRef(false);
  const store = useCallStore();

  const [isSupported] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  });

  const [interimText, setInterimText] = useState("");

  const startTranscription = useCallback(() => {
    if (!isSupported) return;

    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          const entry = {
            speaker_id: speakerId,
            speaker_name: speakerName,
            text: transcript.trim(),
            timestamp_ms: Date.now(),
          };
          store.addTranscriptEntry(entry);
          onEntry?.(entry);
          setInterimText("");
        } else {
          interim += transcript;
        }
      }

      if (interim) setInterimText(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // "no-speech" and "aborted" are expected, just restart
      if (event.error === "no-speech" || event.error === "aborted") return;
      console.warn("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      // Auto-restart (browsers cut after ~60s silence)
      if (shouldRestartRef.current) {
        try {
          recognition.start();
        } catch {
          // Already started or disposed
        }
      }
    };

    recognitionRef.current = recognition;
    shouldRestartRef.current = true;

    try {
      recognition.start();
      store.setTranscribing(true);
    } catch {
      // Already started
    }
  }, [isSupported, language, speakerId, speakerName, store, onEntry]);

  const stopTranscription = useCallback(() => {
    shouldRestartRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    store.setTranscribing(false);
    setInterimText("");
  }, [store]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      recognitionRef.current?.stop();
    };
  }, []);

  return {
    isSupported,
    interimText,
    startTranscription,
    stopTranscription,
  };
}
