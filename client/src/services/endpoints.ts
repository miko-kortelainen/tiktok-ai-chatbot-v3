import type { Prompts } from "../components/moderation/PromptEditPanel";
import type { CommentRequest } from "@tiktok-ai-chatbot/shared";
import api from "./api";

export const startLiveConnection = async (username: string): Promise<boolean> => {
  try {
    const response = await api.post(`/api/start-connection/${username}`);
    if (response.status === 200) return true;

    return false;
  } catch {
    console.log("Failed connection to tiktok live");
    return false;
  }
};

// Handle deletion of a comment from the queue
export const deleteCommentFromQueue = async (index: number): Promise<boolean> => {
  try {
    const response = await api.delete(`/api/comment/${index}`);
    if (response.status === 204) return true;

    return false;
  } catch {
    console.error("Failed to delete comment from queue");
    return false;
  }
};

export const updatePrompts = async (prompts: Prompts): Promise<boolean> => {
  try {
    await api.post("/api/updatePrompts", prompts);

    return true;
  } catch {
    console.error("Failed to update prompts");
    return false;
  }
};

export const sendTestComment = async (comment: CommentRequest): Promise<boolean> => {
  try {
    await api.post("/api/comment", comment);

    return true;
  } catch {
    console.error("Failed to send test comment");
    return false;
  }
};
