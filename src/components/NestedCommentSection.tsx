"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CommentAuthor {
  id?: number;
  name?: string;
  email: string;
  image?: string;
}

interface NestedComment {
  id: number;
  content: string;
  authorName: string;
  authorEmail: string;
  author?: CommentAuthor;
  createdAt: string;
  replies?: NestedComment[];
}

interface NestedCommentDisplayProps {
  comment: NestedComment;
  postId: number;
  onReplySubmit: (parentId: number, content: string) => Promise<void>;
  depth?: number;
}

export function NestedCommentDisplay({
  comment,
  postId,
  onReplySubmit,
  depth = 0,
}: NestedCommentDisplayProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      await onReplySubmit(comment.id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const author = comment.author || {
    name: comment.authorName,
    email: comment.authorEmail,
  };

  return (
    <div
      className={`${depth > 0 ? "ml-4 md:ml-8 border-l-2 border-gray-200 pl-4" : ""}`}
    >
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">
                {author.name || author.email}
              </h4>
              <p className="text-sm text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">{comment.content}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            {showReplyForm ? "Cancel" : "Reply"}
          </Button>

          {showReplyForm && (
            <div className="mt-4 space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSubmitReply}
                  disabled={submitting || !replyContent.trim()}
                >
                  {submitting ? "Posting..." : "Post Reply"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <NestedCommentDisplay
              key={reply.id}
              comment={reply}
              postId={postId}
              onReplySubmit={onReplySubmit}
              depth={(depth || 0) + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface NestedCommentSectionProps {
  postId: number;
  comments: NestedComment[];
  onRefresh: () => Promise<void>;
}

export function NestedCommentSection({
  postId,
  comments,
  onRefresh,
}: NestedCommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitComment = async (parentId?: number, content?: string) => {
    const bodyContent = content || newComment;
    if (!bodyContent.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: bodyContent,
          ...(parentId && { parentId }),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post comment");
      }

      setNewComment("");
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-8">
      <h3 className="text-2xl font-bold mb-6">Comments ({comments.length})</h3>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* New Comment Form */}
      <Card className="mb-8">
        <CardHeader>
          <h4 className="font-semibold">Leave a Comment</h4>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
            <Button
              onClick={() => handleSubmitComment()}
              disabled={submitting || !newComment.trim()}
              className="w-full sm:w-auto"
            >
              {submitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <NestedCommentDisplay
              key={comment.id}
              comment={comment}
              postId={postId}
              onReplySubmit={handleSubmitComment}
            />
          ))
        )}
      </div>
    </section>
  );
}
