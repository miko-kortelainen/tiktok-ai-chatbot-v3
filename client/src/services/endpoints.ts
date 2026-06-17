import type { Prompts } from "../components/moderation/PromptEditPanel";
import api from "./api";

export const tiktokLiveService = {
  async startLiveConnection(username: string) {
    try {
      const response = await api.post("/api/username", { username });
      return response.data;
    } catch {
      console.log("Failed connection to tiktok live");
    }
  },
};

// Handle deletion of a comment from the queue
export const deleteCommentFromQueue = async (index: number): Promise<boolean> => {
  try {
    await api.delete("/api/deleteComment", { data: { index } });

    return true;
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
