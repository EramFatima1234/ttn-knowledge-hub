"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Input } from "antd";
import { CloseOutlined, RobotOutlined, SendOutlined } from "@ant-design/icons";
import { AnimatePresence, motion } from "framer-motion";
import type { AiDiscoverResponse } from "@knowledgehub/types";
import { streamAiDiscover, useAiDiscover, useAiStatus } from "@/hooks/useAi";
import { useAiDrawerStore } from "@/store/useAiDrawerStore";
import MarkdownContent from "@/features/ai/MarkdownContent";
import AiContentRefs from "@/features/ai/AiContentRefs";
import AiPromptCards from "@/features/ai/AiPromptCards";
import AiTypingIndicator from "@/features/ai/AiTypingIndicator";
import AiMessageToolbar from "@/features/ai/AiMessageToolbar";
import { getApiErrorMessage } from "@/lib/api";

type ChatTurn = {
  id: string;
  role: "user" | "assistant";
  content: string;
  result?: AiDiscoverResponse;
};

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function KnowledgeHubAiDrawer() {
  const open = useAiDrawerStore((s) => s.open);
  const setOpen = useAiDrawerStore((s) => s.setOpen);
  const { data: status } = useAiStatus(open);
  const discover = useAiDiscover();

  const [prompt, setPrompt] = useState("");
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("kh-ai-drawer-open");
    return () => document.body.classList.remove("kh-ai-drawer-open");
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, streamText, streaming]);

  const runPrompt = useCallback(
    async (value: string) => {
      const text = value.trim();
      if (!text || streaming || discover.isPending) return;

      setError(null);
      setStreamText("");
      setLastPrompt(text);
      setPrompt(text);

      const userTurn: ChatTurn = { id: newId(), role: "user", content: text };
      setTurns((prev) => [...prev, userTurn]);

      const assistantId = newId();

      if (status?.streaming) {
        setStreaming(true);
        await streamAiDiscover(text, {
          onDelta: (chunk) => setStreamText((prev) => prev + chunk),
          onDone: (payload) => {
            setStreaming(false);
            setStreamText("");
            setTurns((prev) => [
              ...prev,
              {
                id: assistantId,
                role: "assistant",
                content: payload.answer,
                result: payload,
              },
            ]);
          },
          onError: async (message) => {
            setStreaming(false);
            setStreamText("");
            try {
              const data = await discover.mutateAsync(text);
              setTurns((prev) => [
                ...prev,
                {
                  id: assistantId,
                  role: "assistant",
                  content: data.answer,
                  result: data,
                },
              ]);
              setError(null);
            } catch {
              setError(message);
            }
          },
        });
        return;
      }

      try {
        const data = await discover.mutateAsync(text);
        setTurns((prev) => [
          ...prev,
          { id: assistantId, role: "assistant", content: data.answer, result: data },
        ]);
      } catch (err) {
        setError(getApiErrorMessage(err));
      }
    },
    [discover, status?.streaming, streaming],
  );

  const loading = streaming || discover.isPending;
  const showWelcome = turns.length === 0 && !loading && !streamText;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="kh-ai-backdrop"
            aria-label="Close AI assistant"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className="kh-ai-panel"
            role="dialog"
            aria-label="KnowledgeHub AI"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <header className="kh-ai-panel__header">
              <motion.div
                className="kh-ai-panel__logo"
                initial={{ scale: 0.6, rotate: -20, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 22, delay: 0.1 }}
              >
                <RobotOutlined />
              </motion.div>
              <div>
                <p className="kh-ai-panel__brand">✨ KnowledgeHub AI</p>
                <p className="kh-ai-panel__subtitle">Learning discovery assistant</p>
              </div>
              <button
                type="button"
                className="kh-ai-panel__close"
                aria-label="Close"
                onClick={() => setOpen(false)}
              >
                <CloseOutlined />
              </button>
            </header>

            <div className="kh-ai-panel__body" ref={scrollRef}>
              {showWelcome && (
                <motion.div
                  className="kh-ai-welcome"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.35 }}
                >
                  <h2>Hi there 👋</h2>
                  <p>
                    I&apos;m your AI Learning Assistant. I can help you discover sessions,
                    summarize videos, recommend learning paths, and answer technical questions.
                  </p>
                  {!status?.enabled && (
                    <Alert
                      type="info"
                      showIcon
                      className="kh-ai-panel__alert"
                      title="Add GEMINI_API_KEY on the API for full AI answers. Catalog suggestions still work."
                    />
                  )}
                  <AiPromptCards onSelect={(p) => void runPrompt(p)} />
                </motion.div>
              )}

              <div className="kh-ai-thread">
                {turns.map((turn) => (
                  <motion.div
                    key={turn.id}
                    className={`kh-ai-bubble kh-ai-bubble--${turn.role}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {turn.role === "assistant" ? (
                      <>
                        <MarkdownContent content={turn.content} />
                        {turn.result && (
                          <AiContentRefs
                            sessions={turn.result.sessions}
                            series={turn.result.series}
                            speakers={turn.result.speakers}
                            competencies={turn.result.competencies}
                          />
                        )}
                        <AiMessageToolbar
                          text={turn.content}
                          onRegenerate={() => void runPrompt(lastPrompt)}
                        />
                      </>
                    ) : (
                      <p>{turn.content}</p>
                    )}
                  </motion.div>
                ))}

                {streaming && (
                  <div className="kh-ai-bubble kh-ai-bubble--assistant kh-ai-bubble--streaming">
                    {streamText ? (
                      <>
                        <MarkdownContent content={streamText} />
                        <span className="kh-ai-stream-cursor" aria-hidden />
                      </>
                    ) : (
                      <AiTypingIndicator />
                    )}
                  </div>
                )}

                {loading && !streaming && <AiTypingIndicator />}

                {error && <Alert type="error" showIcon title={error} className="kh-ai-panel__alert" />}
              </div>
            </div>

            <footer className="kh-ai-panel__composer">
              <Input.TextArea
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask about sessions, paths, speakers…"
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    void runPrompt(prompt);
                  }
                }}
              />
              <button
                type="button"
                className="kh-ai-panel__send"
                disabled={loading}
                onClick={() => void runPrompt(prompt)}
                aria-label="Send message"
              >
                <SendOutlined />
              </button>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
