import { useEffect, useState, type FormEvent } from "react";
import Alert from "./Alert";
import ProfileAvatar from "./ProfileAvatar";
import Spinner from "./Spinner";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { useFetch } from "../hooks/useFetch";
import type { ApiMessage, Comment } from "../types";
import { authHeaders } from "../utils/authHeaders";

const API_URL = import.meta.env.VITE_API_URL;

function sameId(left: string | null | undefined, right: string | null | undefined) {
  return Boolean(left) && left === right;
}

export default function TaskComments({
  projectId,
  taskId,
  canModerate,
  locked = false,
}: {
  projectId: string;
  taskId: string;
  canModerate: boolean;
  locked?: boolean;
}) {
  const { token, user } = useAuth();
  const list = useFetch<Comment[]>(
    token ? `${API_URL}/api/projects/${projectId}/tasks/${taskId}/comments` : null,
    authHeaders(token),
  );
  const createApi = useApi<Comment>({ token });
  const deleteApi = useApi<ApiMessage>({ token });
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [posting, setPosting] = useState<"comment" | "reply" | null>(null);

  useEffect(() => {
    if (list.data) {
      setComments(list.data);
    }
  }, [list.data]);

  const roots = comments.filter((comment) => !comment.parent);

  async function submit(event: FormEvent, body: { text: string; parent?: string }) {
    event.preventDefault();
    if (!body.text.trim()) {
      setFormError("Write a comment.");
      return;
    }

    setFormError(null);
    setPosting(body.parent ? "reply" : "comment");
    const created = await createApi.post<typeof body>(
      `/api/projects/${projectId}/tasks/${taskId}/comments`,
      { text: body.text.trim(), parent: body.parent },
    );
    setPosting(null);
    if (!created) {
      return;
    }

    setComments((current) => [...current, created]);
    if (body.parent) {
      setReplyTo(null);
      setReplyText("");
    } else {
      setText("");
    }
  }

  async function remove(commentId: string) {
    const result = await deleteApi.del(`/api/projects/${projectId}/tasks/${taskId}/comments/${commentId}`);
    if (!result) {
      return;
    }
    setComments((current) => current.filter((comment) => comment._id !== commentId && comment.parent !== commentId));
  }

  function canRemove(comment: Comment) {
    return canModerate || sameId(comment.user?._id, user?._id);
  }

  return (
    <div className="space-y-4">
      {list.loading && comments.length === 0 ? (
        <Spinner label="Loading comments..." />
      ) : roots.length === 0 ? (
        <p className="text-sm text-stone-500 dark:text-stone-400">No comments yet.</p>
      ) : (
        <ul className="space-y-3">
          {roots.map((comment) => (
            <li key={comment._id} className="rounded border border-stone-200 p-3 dark:border-stone-700">
              <CommentBody comment={comment} canRemove={!locked && canRemove(comment)} onRemove={() => remove(comment._id)} />
              <ul className="mt-3 space-y-2 border-l-2 border-stone-200 pl-3 dark:border-stone-700">
                {comments
                  .filter((reply) => reply.parent === comment._id)
                  .map((reply) => (
                    <li key={reply._id}>
                      <CommentBody comment={reply} canRemove={!locked && canRemove(reply)} onRemove={() => remove(reply._id)} />
                    </li>
                  ))}
              </ul>
              {locked ? null : replyTo === comment._id ? (
                <form className="mt-3 space-y-2" onSubmit={(event) => submit(event, { text: replyText, parent: comment._id })}>
                  <label className="block text-sm">
                    <span>Reply</span>
                    <textarea
                      className="field mt-1 min-h-16"
                      value={replyText}
                      maxLength={1000}
                      onChange={(event) => setReplyText(event.target.value)}
                      required
                    />
                  </label>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="rounded px-2 py-1 text-sm text-stone-500 dark:text-stone-400"
                      onClick={() => {
                        setReplyTo(null);
                        setReplyText("");
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded bg-teal-800 px-3 py-1 text-sm text-white disabled:opacity-60"
                      disabled={posting !== null}
                    >
                      {posting === "reply" ? "Posting..." : "Post reply"}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  className="mt-2 text-sm text-teal-800 dark:text-teal-300"
                  onClick={() => {
                    setReplyTo(comment._id);
                    setReplyText("");
                    setFormError(null);
                  }}
                >
                  Reply
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {locked ? (
        <p className="text-sm text-stone-500 dark:text-stone-400">Comments stay read only until this project is reopened.</p>
      ) : (
      <form className="space-y-2" onSubmit={(event) => submit(event, { text })}>
        <label className="block">
          <span>Comment</span>
          <textarea
            className="field mt-1 min-h-20"
            value={text}
            maxLength={1000}
            onChange={(event) => setText(event.target.value)}
            required
          />
        </label>
        <Alert message={formError ?? list.error ?? createApi.error?.message ?? deleteApi.error?.message ?? null} />
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded bg-teal-800 px-3 py-2 text-white disabled:opacity-60"
            disabled={posting !== null}
          >
            {posting === "comment" ? <Spinner label="Posting..." light /> : "Post comment"}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}

function CommentBody({
  comment,
  canRemove,
  onRemove,
}: {
  comment: Comment;
  canRemove: boolean;
  onRemove: () => void;
}) {
  const name = comment.user?.fullName || comment.user?.username || "Someone";

  return (
    <div className="flex gap-2">
      <ProfileAvatar name={name} photo={comment.user?.profilePhoto} className="h-8 w-8" />
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-medium">{name}</span>
          <span className="ml-2 text-xs text-stone-500 dark:text-stone-400">
            {new Date(comment.createdAt).toLocaleString()}
          </span>
        </p>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm">{comment.text}</p>
        {canRemove && (
          <button type="button" className="mt-1 text-sm text-red-700 dark:text-red-300" onClick={onRemove}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
