import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../SocketProvider";
import TypingIndicator from "../TypingIndicator";

const MAX_MESSAGES = 2;

const followRoles: Record<string, string> = {
  "0": "Not following",
  "1": "Following",
  "2": "Friend",
  "3": "AI",
};

interface Message {
  className: string;
  username: string;
  commentText: string;
  followRole: string;
}

const MessageBox = ({ message }: { message: Message }) => (
  <h3 className={message.className}>
    <div className="msg-top">
      <span className="username">{message.username}</span>
      <span className="follow-role">{followRoles[message.followRole] || ""}</span>
    </div>
    <span className="comment-txt">{message.commentText}</span>
  </h3>
);

const ChatContainer = () => {
  const socket = useContext(SocketContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const addMsg = (m: Message) =>
    setMessages((prev) => {
      const newMsgs = prev.length >= MAX_MESSAGES ? [m] : [...prev, m];
      setIsTyping(newMsgs.length === 1);
      return newMsgs;
    });

  const playAudio = async (text: string, base64Audio: string | null) => {
    if (!socket) return console.error("Socket not initialized");

    // Always show the text message
    addMsg({ username: "👽", commentText: text, followRole: "3", className: "answer" });

    if (!base64Audio) {
      console.error("No audio data received from server");
      socket.emit("TextToSpeechStatus", { status: "error" });
      return;
    }

    try {
      // Decode base64 audio to a blob
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "audio/mpeg" });

      console.log("Audio blob size:", blob.size);

      if (blob.size === 0) {
        console.error("Received empty audio blob");
        throw new Error("Received empty audio data");
      }

      const audioUrl = URL.createObjectURL(blob);
      console.log("Created audio URL:", audioUrl);

      const audio = new Audio(audioUrl);

      audio.onended = () => {
        console.log("Audio playback ended");
        URL.revokeObjectURL(audioUrl);
        socket.emit("TextToSpeechStatus", { status: "ended" });
      };

      audio.onerror = (err) => {
        console.error("Audio playback error:", err);
        URL.revokeObjectURL(audioUrl);
        socket.emit("TextToSpeechStatus", { status: "error" });
      };

      console.log("Starting audio playback...");
      await audio.play();
      console.log("Audio playback started successfully");
    } catch (err) {
      console.error("TTS playback error:", err);
      socket.emit("TextToSpeechStatus", { status: "error" });
    }
  };

  type TikTokComment = {
    username: string;
    content: string;
    followRole: string;
  };

  useEffect(() => {
    if (!socket) return;

    const onComment = (comment: TikTokComment) => {
      addMsg({
        username: comment.username,
        commentText: comment.content,
        followRole: comment.followRole,
        className: "comment",
      });
    };

    const onAnswer = (data: { text: string; audio: string | null }) => {
      console.log("Received Answer:", data.text);
      playAudio(data.text, data.audio);
    };

    socket.on("Comment", onComment);
    socket.on("Answer", onAnswer);
    return () => {
      socket.off("Comment");
      socket.off("Answer");
    };
  }, [socket]);

  return (
    <div className="chat-container">
      {messages.map((m, i) => (
        <MessageBox key={i} message={m} />
      ))}
      <TypingIndicator isTyping={isTyping} />
    </div>
  );
};

export default ChatContainer;
