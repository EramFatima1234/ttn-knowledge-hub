"use client";

import { useState } from "react";
import { Button, Input, List, Tag } from "antd";
import AspireButton from "@/components/ui/AspireButton";
import MarkdownBody from "@/components/common/MarkdownBody";
import {
  useCreateAnswer,
  useCreateQuestion,
  useVideoQuestions,
  useVoteQuestion,
} from "@/hooks/usePhase7Features";

interface QaSectionProps {
  videoId: string;
}

export default function QaSection({ videoId }: QaSectionProps) {
  const { data: questions = [], isLoading } = useVideoQuestions(videoId);
  const createQuestion = useCreateQuestion(videoId);
  const voteQuestion = useVoteQuestion(videoId);
  const [questionBody, setQuestionBody] = useState("");
  const [replyBodies, setReplyBodies] = useState<Record<string, string>>({});

  return (
    <section className="kh-qa">
      <h2>Q&amp;A</h2>
      <p className="kh-qa__hint">Markdown and code blocks supported.</p>

      <div className="kh-qa__form">
        <Input.TextArea
          rows={3}
          value={questionBody}
          onChange={(e) => setQuestionBody(e.target.value)}
          placeholder="Ask a question about this session..."
        />
        <AspireButton
          loading={createQuestion.isPending}
          onClick={async () => {
            if (!questionBody.trim()) return;
            await createQuestion.mutateAsync(questionBody.trim());
            setQuestionBody("");
          }}
        >
          Ask Question
        </AspireButton>
      </div>

      <List
        loading={isLoading}
        dataSource={questions}
        locale={{ emptyText: "No questions yet. Start the discussion!" }}
        renderItem={(question) => (
          <QaQuestionItem
            key={question.id}
            question={question}
            videoId={videoId}
            replyBody={replyBodies[question.id] ?? ""}
            onReplyChange={(value) =>
              setReplyBodies((prev) => ({ ...prev, [question.id]: value }))
            }
            onVote={(value) =>
              voteQuestion.mutate({ questionId: question.id, value })
            }
          />
        )}
      />
    </section>
  );
}

function QaQuestionItem({
  question,
  videoId,
  replyBody,
  onReplyChange,
  onVote,
}: {
  question: {
    id: string;
    body: string;
    isPinned: boolean;
    voteScore: number;
    answers: Array<{
      id: string;
      body: string;
      isAccepted: boolean;
      isPinned: boolean;
      voteScore: number;
      user: { name: string };
    }>;
  };
  videoId: string;
  replyBody: string;
  onReplyChange: (value: string) => void;
  onVote: (value: 1 | -1) => void;
}) {
  const createAnswer = useCreateAnswer(question.id, videoId);

  return (
    <List.Item className="kh-qa__question">
      <div className="kh-qa__question-body">
        {question.isPinned && <Tag color="magenta">Pinned</Tag>}
        <MarkdownBody content={question.body} />
        <div className="kh-qa__votes">
          <Button size="small" onClick={() => onVote(1)}>
            ▲ {question.voteScore}
          </Button>
          <Button size="small" onClick={() => onVote(-1)}>
            ▼
          </Button>
        </div>
      </div>

      <div className="kh-qa__answers">
        {question.answers.map((answer) => (
          <div
            key={answer.id}
            className={`kh-qa__answer${answer.isAccepted ? " kh-qa__answer--accepted" : ""}`}
          >
            {answer.isAccepted && <Tag color="green">Accepted</Tag>}
            {answer.isPinned && <Tag>Pinned</Tag>}
            <MarkdownBody content={answer.body} />
            <small>
              {answer.user.name} · score {answer.voteScore}
            </small>
          </div>
        ))}
      </div>

      <div className="kh-qa__reply">
        <Input.TextArea
          rows={2}
          value={replyBody}
          onChange={(e) => onReplyChange(e.target.value)}
          placeholder="Write an answer (markdown supported)..."
        />
        <AspireButton
          aspireVariant="secondary"
          size="small"
          loading={createAnswer.isPending}
          onClick={async () => {
            if (!replyBody.trim()) return;
            await createAnswer.mutateAsync(replyBody.trim());
            onReplyChange("");
          }}
        >
          Answer
        </AspireButton>
      </div>
    </List.Item>
  );
}
