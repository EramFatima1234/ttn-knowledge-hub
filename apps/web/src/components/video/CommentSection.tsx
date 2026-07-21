"use client";

import { Button, Input, List, Spin, Typography } from "antd";
import AspireButton from "@/components/ui/AspireButton";
import { ContentType } from "@knowledgehub/types";
import { useCreateComment, useComments } from "@/hooks/useContent";
import { useState } from "react";

interface CommentSectionProps {
  contentType: ContentType;
  contentId: string;
}

export default function CommentSection({
  contentType,
  contentId,
}: CommentSectionProps) {
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const { data: comments, isLoading } = useComments(contentType, contentId);
  const createComment = useCreateComment();

  const submit = async () => {
    if (!body.trim()) return;
    await createComment.mutateAsync({
      contentType,
      contentId,
      body: body.trim(),
      parentId: replyTo ?? undefined,
    });
    setBody("");
    setReplyTo(null);
  };

  if (isLoading) {
    return (
      <div className="kh-comments__loading">
        <Spin />
      </div>
    );
  }

  return (
    <section className="kh-comments">
      <Typography.Title level={4}>Comments</Typography.Title>

      <div className="kh-comments__form">
        <Input.TextArea
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={replyTo ? "Write a reply..." : "Share your thoughts..."}
        />
        <div className="kh-comments__actions">
          {replyTo && (
            <Button type="link" onClick={() => setReplyTo(null)}>
              Cancel reply
            </Button>
          )}
          <AspireButton onClick={submit} loading={createComment.isPending}>
            {replyTo ? "Reply" : "Comment"}
          </AspireButton>
        </div>
      </div>

      <List
        dataSource={comments ?? []}
        locale={{ emptyText: "No comments yet. Start the conversation." }}
        renderItem={(comment) => (
          <List.Item className="kh-comment">
            <div className="kh-comment__content">
              <div className="kh-comment__header">
                <strong>{comment.user.name}</strong>
                <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                {comment.isPinned && <span className="kh-comment__pinned">Pinned</span>}
              </div>
              <p>{comment.body}</p>
              <Button type="link" size="small" onClick={() => setReplyTo(comment.id)}>
                Reply
              </Button>
              {comment.replies.map((reply) => (
                <div key={reply.id} className="kh-comment__reply">
                  <strong>{reply.user.name}</strong>
                  <p>{reply.body}</p>
                </div>
              ))}
            </div>
          </List.Item>
        )}
      />
    </section>
  );
}
