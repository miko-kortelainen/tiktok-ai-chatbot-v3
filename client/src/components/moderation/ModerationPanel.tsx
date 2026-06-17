import { useEffect, useState } from "react";
import { useSocket } from "../hooks/SocketProvider.tsx";
import ModQueuePanel from "./ModQueuePanel.tsx";
import PromptEditPanel from "./PromptEditPanel.tsx";
import TestCommentPanel from "./TestCommentPanel.tsx";
import "../css/ModerationPanel.css";
import { deleteCommentFromQueue } from "../../services/endpoints.ts";

type QueueItem = {
  user: string;
  comment: string;
  followRole: string;
};

function ModerationPanel() {
  const socket = useSocket();
  const [queueList, setQueueList] = useState<QueueItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (socket) {
      // Listen for queue updates from the server
      socket.on("UpdateQueue", (queue: QueueItem[]) => {
        setQueueList(queue);
        setError("");
      });

      socket.on("connect_error", () => setError("Failed to connect to the server"));

      return () => {
        socket.off("UpdateQueue");
        socket.off("connect_error");
      };
    }
  }, [socket]);

  async function deleteComment(index: number) {
    const success = await deleteCommentFromQueue(index);

    if (!success) {
      setError("Failed to delete comment");
      return;
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "0":
        return "Nonfollower";
      case "1":
        return "Follower";
      case "2":
        return "Friend";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="mod-panel-site">
      <ModQueuePanel queueList={queueList} error={error} deleteComment={deleteComment} getRoleLabel={getRoleLabel} />

      <div className="side-panels">
        <TestCommentPanel />
        <PromptEditPanel />
      </div>
    </div>
  );
}

export default ModerationPanel;
