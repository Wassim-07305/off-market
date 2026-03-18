"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/hooks/use-supabase";
import { X, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  timestamp: Date;
}

interface CallChatPanelProps {
  callId: string;
  onClose: () => void;
}

export function CallChatPanel({ callId, onClose }: CallChatPanelProps) {
  const { user, profile } = useAuth();
  const supabase = useSupabase();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  // Subscribe to real-time chat via Supabase channel
  useEffect(() => {
    const channel = supabase.channel(`call-chat-${callId}`);

    channel
      .on("broadcast", { event: "chat_message" }, (payload) => {
        const msg = payload.payload as ChatMessage;
        setMessages((prev) => [
          ...prev,
          { ...msg, timestamp: new Date(msg.timestamp) },
        ]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, callId]);

  const sendMessage = () => {
    if (!input.trim() || !user) return;

    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      sender_id: user.id,
      sender_name: profile?.full_name ?? "Moi",
      content: input.trim(),
      timestamp: new Date(),
    };

    // Add locally immediately
    setMessages((prev) => [...prev, msg]);

    // Broadcast to other participants
    supabase.channel(`call-chat-${callId}`).send({
      type: "broadcast",
      event: "chat_message",
      payload: msg,
    });

    setInput("");
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-80 lg:w-96 bg-zinc-900/95 border-l border-white/5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Send className="w-4 h-4 text-primary" />
          Chat
        </h3>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <Send className="w-6 h-6 mb-2 text-zinc-600" />
            <p className="text-xs">Aucun message</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">
              Les messages disparaissent a la fin de l&apos;appel
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col",
                isMe ? "items-end" : "items-start",
              )}
            >
              {!isMe && (
                <span className="text-[10px] text-zinc-500 mb-0.5 ml-1">
                  {msg.sender_name}
                </span>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                  isMe
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-white/10 text-zinc-200 rounded-bl-sm",
                )}
              >
                {msg.content}
              </div>
              <span className="text-[9px] text-zinc-600 mt-0.5 mx-1">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ecrire un message..."
            className="flex-1 h-9 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white hover:bg-primary/80 disabled:opacity-30 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
