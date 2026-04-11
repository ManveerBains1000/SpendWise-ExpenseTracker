import { useEffect, useRef, useState, useContext, useCallback } from "react";
import axios from "axios";
import { SocketContext } from "../context/SocketContext";
import { AuthContext } from "../context/AuthContext";

/**
 * ExpenseComments
 * Full real-time comment thread for a single expense.
 *
 * Props:
 *   expenseId  – MongoDB ObjectId string of the expense
 *   onClose    – callback to close/hide this panel
 */
const ExpenseComments = ({ expenseId, onClose }) => {
  const { socket } = useContext(SocketContext);
  const { user } = useContext(AuthContext);

  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]); // [{ userId, username }]
  const [presence, setPresence] = useState([]);         // [{ userId, username }]

  const bottomRef = useRef(null);
  const typingTimerRef = useRef(null);

  // ── Fetch initial comments via REST ────────────────────────────────────────
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/v1/comments/${expenseId}`,
          { withCredentials: true }
        );
        setComments(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch comments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [expenseId]);

  // ── Socket.io event wiring ──────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // Join the expense room → triggers server-side presence broadcast
    socket.emit("join-expense", { expenseId });

    const handleNewComment = ({ comment }) => {
      setComments((prev) => [...prev, comment]);
      // Clear typing indicator for this user
      setTypingUsers((prev) =>
        prev.filter((u) => u.userId !== comment.author._id)
      );
    };

    const handlePresence = ({ expenseId: eid, users }) => {
      if (eid === expenseId) setPresence(users);
    };

    const handleTyping = ({ expenseId: eid, userId, username, isTyping }) => {
      if (eid !== expenseId || userId === user?._id) return;
      setTypingUsers((prev) => {
        const filtered = prev.filter((u) => u.userId !== userId);
        return isTyping ? [...filtered, { userId, username }] : filtered;
      });
    };

    socket.on("new-comment", handleNewComment);
    socket.on("presence-update", handlePresence);
    socket.on("typing-update", handleTyping);

    return () => {
      socket.emit("leave-expense", { expenseId });
      socket.off("new-comment", handleNewComment);
      socket.off("presence-update", handlePresence);
      socket.off("typing-update", handleTyping);
    };
  }, [socket, expenseId, user]);

  // ── Auto-scroll to latest message ──────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments, typingUsers]);

  // ── Send comment via Socket.io ──────────────────────────────────────────────
  const handleSend = useCallback(() => {
    if (!text.trim() || !socket) return;
    socket.emit("send-comment", { expenseId, text: text.trim() });
    // Stop typing indicator
    socket.emit("typing", { expenseId, isTyping: false });
    setText("");
  }, [socket, expenseId, text]);

  // ── Typing indicator ────────────────────────────────────────────────────────
  const handleTypingInput = (e) => {
    setText(e.target.value);
    if (!socket) return;
    socket.emit("typing", { expenseId, isTyping: true });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit("typing", { expenseId, isTyping: false });
    }, 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const viewersExceptSelf = presence.filter((p) => p.userId !== user?._id?.toString());

  return (
    <div className="flex flex-col h-full bg-[var(--card-dark)] border border-[var(--border-dark)] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-dark)]">
        <h3 className="font-semibold text-sm">Comments</h3>
        <div className="flex items-center gap-2">
          {/* Presence Indicator */}
          {viewersExceptSelf.length > 0 && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
              {viewersExceptSelf.map((u) => u.username).join(", ")}
              {viewersExceptSelf.length === 1 ? " is" : " are"} viewing
            </span>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {loading && (
          <p className="text-xs text-[var(--text-muted)]">Loading…</p>
        )}
        {!loading && comments.length === 0 && (
          <p className="text-xs text-[var(--text-muted)]">
            No comments yet. Start the discussion!
          </p>
        )}
        {comments.map((c) => {
          const isMine = c.author?._id === user?._id || c.author?._id?.toString() === user?._id?.toString();
          return (
            <div
              key={c._id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                  isMine
                    ? "bg-[var(--accent)] text-white rounded-br-none"
                    : "bg-[var(--bg-dark)] text-[var(--text-primary)] rounded-bl-none border border-[var(--border-dark)]"
                }`}
              >
                {!isMine && (
                  <p className="text-xs font-semibold mb-1 text-[var(--accent)]">
                    {c.author?.username || "unknown"}
                  </p>
                )}
                <p className="break-words">{c.text}</p>
                <p className="text-xs opacity-60 mt-1 text-right">
                  {new Date(c.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-[var(--bg-dark)] border border-[var(--border-dark)] px-3 py-2 rounded-lg text-xs text-[var(--text-muted)] italic">
              {typingUsers.map((u) => u.username).join(", ")}{" "}
              {typingUsers.length === 1 ? "is" : "are"} typing
              <span className="animate-pulse">…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[var(--border-dark)] flex gap-2">
        <textarea
          rows={1}
          value={text}
          onChange={handleTypingInput}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment… (Enter to send)"
          className="flex-1 bg-[var(--bg-dark)] border border-[var(--border-dark)] rounded px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none focus:outline-none focus:border-[var(--accent)]"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="bg-[var(--accent)] px-4 py-2 rounded text-sm font-semibold disabled:opacity-40 hover:opacity-90 shrink-0"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ExpenseComments;
