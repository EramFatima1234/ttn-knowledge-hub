"use client";

import { useState } from "react";
import { Alert, Button, Card, Collapse, Radio, Space, Spin } from "antd";
import { BulbOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { useAiVideoQuiz, useAiVideoSummary, useAiStatus } from "@/hooks/useAi";
import MarkdownContent from "@/features/ai/MarkdownContent";
import { getApiErrorMessage } from "@/lib/api";

export default function VideoAiPanel({ videoId }: { videoId: string }) {
  const { data: status } = useAiStatus();
  const summary = useAiVideoSummary(videoId);
  const quiz = useAiVideoQuiz(videoId);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  if (!status?.enabled) {
    return (
      <Card className="kh-ai-watch-card" size="small">
        <Alert
          type="info"
          showIcon
          title="AI Summary & Quiz"
          description="Set GEMINI_API_KEY on the API server to enable ✨ AI features on this page."
        />
      </Card>
    );
  }

  return (
    <Collapse
      className="kh-ai-watch"
      items={[
        {
          key: "summary",
          label: (
            <span>
              <BulbOutlined /> AI Summary
            </span>
          ),
          children: (
            <div>
              {!summary.data && !summary.isPending && (
                <Button type="primary" ghost onClick={() => summary.mutate()}>
                  ✨ Generate summary
                </Button>
              )}
              {summary.isPending && (
                <div className="kh-ai-watch__loading">
                  <Spin size="small" /> Generating summary…
                </div>
              )}
              {summary.isError && (
                <Alert type="error" title={getApiErrorMessage(summary.error)} />
              )}
              {summary.data && (
                <>
                  <MarkdownContent content={summary.data.summary} />
                  <ul className="kh-ai-takeaways">
                    {summary.data.keyTakeaways.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ),
        },
        {
          key: "quiz",
          label: (
            <span>
              <QuestionCircleOutlined /> AI Quiz
            </span>
          ),
          children: (
            <div>
              {!quiz.data && !quiz.isPending && (
                <Button type="primary" ghost onClick={() => quiz.mutate()}>
                  Generate 5 MCQs
                </Button>
              )}
              {quiz.isPending && (
                <div className="kh-ai-watch__loading">
                  <Spin size="small" /> Building quiz…
                </div>
              )}
              {quiz.isError && (
                <Alert type="error" title={getApiErrorMessage(quiz.error)} />
              )}
              {quiz.data?.questions.map((q, index) => (
                <Card key={index} size="small" className="kh-ai-quiz-card">
                  <p>
                    <strong>
                      {index + 1}. {q.question}
                    </strong>
                  </p>
                  <Radio.Group
                    value={answers[index]}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [index]: e.target.value }))
                    }
                  >
                    <Space direction="vertical">
                      {q.options.map((opt, optIndex) => (
                        <Radio key={opt} value={optIndex}>
                          {opt}
                        </Radio>
                      ))}
                    </Space>
                  </Radio.Group>
                  {answers[index] !== undefined && (
                    <Alert
                      className="kh-ai-quiz-feedback"
                      type={answers[index] === q.correctIndex ? "success" : "warning"}
                      showIcon
                      title={q.explanation}
                    />
                  )}
                </Card>
              ))}
            </div>
          ),
        },
      ]}
    />
  );
}
