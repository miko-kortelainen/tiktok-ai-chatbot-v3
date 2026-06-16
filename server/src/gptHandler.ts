import { io } from ".";
import { openRouterClient } from "./openrouterclient";
import { TikTokComment } from "./types/comment.type";

import { logger } from "./utils/logger";

const MODEL: string = "openai/gpt-oss-120b";

const prompts = {
  generalUser: `Answer the TikTok live comments in a humorous and natural way.`, // Prompt for general users
  follower: ``, // Prompt for followers
  friend: ``, // Prompt for friends
};

// updates the prompts coming from the client
export function updatePrompts(defaultPrompt: string, followerPrompt: string, friendPrompt: string) {
  prompts.generalUser = defaultPrompt;
  prompts.follower = followerPrompt;
  prompts.friend = friendPrompt;

  console.log(prompts);
}

// Function to handle fetching the gpt response
export async function getAiResponse(comment: TikTokComment): Promise<string> {
  const systemPrompt = generateSystemMessage(comment.followRole);

  try {
    const completion = await openRouterClient.chat.send({
      chatRequest: {
        model: MODEL,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: comment.content,
          },
        ],
      },
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) throw new Error("No output from GPT response");
    console.log("GPT Response:", responseContent);
    return responseContent;
  } catch (error) {
    console.error("Error on callGPT: ", error);
    throw error;
  }
}

function generateSystemMessage(followRole: string) {
  switch (followRole) {
    case "0": // General user
      return prompts.generalUser;
    case "1": // Follower
      return prompts.follower;
    case "2": // Friend
      return prompts.friend;
    default:
      return prompts.generalUser; // Default to general user
  }
}
