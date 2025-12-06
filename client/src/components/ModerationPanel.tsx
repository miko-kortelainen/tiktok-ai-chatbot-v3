import { useContext, useEffect, useState } from "react";
import ModQueuePanel from "./ModQueuePanel.tsx";
import PromptEditPanel from "./PromptEditPanel.tsx";
import { SocketContext } from "./SocketProvider.tsx";
import TestCommentPanel from "./TestCommentPanel.tsx";
import axios from "axios";
import "./css/ModerationPanel.css";

interface QueueItem {
  user: string;
  comment: string;
  followRole: string;
}

function ModerationPanel() {
  const socket = useContext(SocketContext);
  const [queueList, setQueueList] = useState<QueueItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (socket) {
      // Listen for queue updates from the server
      socket.on("UpdateQueue", (data: any) => {
        setQueueList(data);
        setError(""); // Clear any previous errors
      });

      // Handle connection errors
      socket.on("connect_error", () => {
        setError("Failed to connect to the server. Please try again later.");
      });

      // Clean up on unmount
      return () => {
        socket.off("UpdateQueue");
        socket.off("connect_error");
      };
    }
  }, [socket]);

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

  // Handle deletion of a comment from the queue
  const deleteComment = async (index: number) => {
    const response = await axios.delete("/api/deleteComment", {
      data: { index },
    });
    if (response.status !== 200) setError("Failed to delete comment. Please try again.");
  };

  // Function to generate a random comment on the queue for testing purposes
  const generateRandomComment = () => {
    const users = ["User1", "User2", "User3", "User4", "User5"];
    const comments = [
      "This is a test comment, This is a test comment, This is a test comment, This is a test comment, This is a test comment, This is a test comment,",
      "Another random comment",
      "Lorem ipsum dolor sit amet",
      "Testing the moderation panel",
      "Random comment for styling purposes",
    ];
    const roles = [0, 1, 2];

    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomComment = comments[Math.floor(Math.random() * comments.length)];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];

    const comment: QueueItem = {
      user: randomUser,
      comment: randomComment,
      followRole: randomRole.toString(),
    };

    return comment;
  };

  // Function to add a random comment item to the queue
  const addRandomCommentToQueue = () => {
    const randomComment = generateRandomComment(); // Generate a random comment item
    setQueueList((prevQueue) => [...prevQueue, randomComment]); // Add the random comment to the queue
  };

  return (
    <div className="mod-panel-site">
      <ModQueuePanel
        queueList={queueList}
        error={error}
        deleteComment={deleteComment}
        addRandomComment={addRandomCommentToQueue}
        getRoleLabel={getRoleLabel}
      />
      {/* Test */}
      <div className="side-panels">
        <TestCommentPanel />
        <PromptEditPanel />
      </div>
    </div>
  );
}

export default ModerationPanel;
