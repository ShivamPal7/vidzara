import { PromptTemplate } from "./index";
import { Feature } from "../../../../prisma/generated/prisma/enums";

export const TopicGeneratorPrompt: PromptTemplate = {
  name: "Topic Generator",
  feature: Feature.TOPIC_GENERATOR,
  description: "Analyze competitor's recent videos to identify outliers, suggest improvements, and generate viral ideas.",
  generatePrompt: (input: any) => {
    const { channelName, recentVideos, outliers } = input;
    
    // Convert videos array into a readable summary format
    const formatVideos = (videos: any[]) => {
      return videos.map((v, i) => `${i + 1}. Title: "${v.title}" | Views: ${v.viewCount}`).join("\n");
    };

    const recentVideosList = recentVideos && recentVideos.length > 0 
      ? formatVideos(recentVideos) 
      : "No recent videos provided.";
      
    const outliersList = outliers && outliers.length > 0 
      ? formatVideos(outliers) 
      : "No specific outliers identified.";

    return `
You are an expert YouTube Strategist and Data Analyst. Your goal is to analyze the recent performance of a competitor channel, understand what makes their top videos successful, and generate 5 highly viral video ideas for the user to create based on those insights.

**Competitor Channel:** ${channelName}

**Recent Videos (Last 20+ uploads):**
${recentVideosList}

**Outlier Videos (Videos that performed significantly above their average):**
${outliersList}

**Task:**
1. **Analyze Top Content**: Look at the "Outlier Videos" and determine what topics, formats, or psychological hooks are working well for them right now. 
2. **Suggest Improvements**: Identify actionable ways the user can make *better* videos than this competitor (e.g., better pacing, newer information, different perspective).
3. **Generate 5 Viral Ideas**: Provide exactly 5 distinct, high-potential video ideas inspired by the competitor's successful content but improved for virality.

**Output Format (Strict JSON):**
{
  "topContentAnalysis": "A 2-3 sentence analysis of what formats or topics are currently working for this channel based on their outliers.",
  "improvements": [
    "A specific, actionable improvement",
    "Another specific improvement"
  ],
  "viralIdeas": [
    {
      "title": "A highly clickable, optimized title for the idea",
      "topic": "The general topic category",
      "reason": "Why this specific idea will perform well (psychological hook, trend, or format advantage)"
    }
  ]
}
`;
  },
};
