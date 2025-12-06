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
