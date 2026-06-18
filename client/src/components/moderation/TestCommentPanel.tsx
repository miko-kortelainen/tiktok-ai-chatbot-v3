import { useState } from "react";
import { sendTestComment } from "../../services/endpoints";
import type { CommentRequest } from "@tiktok-ai-chatbot/shared";

const TestCommentPanel = () => {
  const [username, setUsername] = useState("");
  const [commentText, setCommentText] = useState("");
  const [followRole, setFollowRole] = useState("0");
  const [error, setError] = useState("");

  // handle sending the comment to backend
  async function handleSendComment() {
    const comment: CommentRequest = {
      user: username,
      content: commentText,
      followRole: "test",
    };

    const success = await sendTestComment(comment);
    if (!success) {
      setError("failed to add comment");
    }
    setError("");
  }

  return (
    <div className="mod-comment-panel">
      <div className="mod-comment-title">
        <h1>Add comment</h1>
        <p>Add a custom comment to the queue.</p>
      </div>
      {error && <p className="error">{error}</p>}

      <div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Comment"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          required
        />
        <select value={followRole} onChange={(e) => setFollowRole(e.target.value)} required>
          <option value="0">None</option>
          <option value="1">Follower</option>
          <option value="2">Friend</option>
        </select>
        <button type="submit" className="add-comment-btn apply-button" onClick={handleSendComment}>
          Add comment
        </button>
      </div>
    </div>
  );
};

export default TestCommentPanel;
