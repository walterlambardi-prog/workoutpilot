import {
    AI_COACH_API_URL,
    AI_COACH_MODEL,
    TEMPERATURE,
} from "@/app/aiCoach/aiCoach.constants";
import type {
    RoutineAnalysisRequest,
    RoutineAnalysisResponse,
} from "@/app/routineAnalysis/routineAnalysis.types";

const buildSystemPrompt = (language: string) => {
  const lang = language?.startsWith("es") ? "español" : "english";

  return `You are a professional fitness coach analyzing workout performance. Respond in ${lang} with ONLY valid JSON (no additional text).

JSON structure:
{
  "overallScore": number (0-100),
  "overallFeedback": "2-3 sentence summary of overall performance",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "exercises": [
    {
      "exerciseId": "exercise-id",
      "performanceScore": number (0-100),
      "feedback": "1-2 sentences about this exercise",
      "suggestions": ["actionable tip 1", "actionable tip 2"]
    }
  ],
  "nextSteps": ["next goal 1", "next goal 2", "next goal 3"]
}

Scoring criteria:
- Compare actual reps vs target reps (main factor)
- Consider completion rate per round
- Consistency across rounds is important
- Award 80+ for meeting targets, 60-79 for close, below 60 for significant gaps

Provide specific, actionable feedback.`;
};

export const analyzeRoutine = async (
  data: RoutineAnalysisRequest,
  language: string = "en",
): Promise<RoutineAnalysisResponse> => {
  const userMessage = JSON.stringify(data, null, 2);

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

  try {
    const response = await fetch(AI_COACH_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_COACH_MODEL,
        messages: [
          {
            role: "system",
            content: buildSystemPrompt(language),
          },
          {
            role: "user",
            content: `Analyze this workout routine:\n${userMessage}`,
          },
        ],
        temperature: TEMPERATURE,
        max_tokens: 1000, // Balanced for useful analysis
        stream: false, // Ensure we get the full response
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(
        `API error: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      console.error("API response:", JSON.stringify(result, null, 2));
      throw new Error("No content in API response");
    }

    if (__DEV__) {
      console.log("[Routine Analysis] AI Response:", content);
    }

    try {
      return JSON.parse(content) as RoutineAnalysisResponse;
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid response format from AI");
    }
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout - AI took too long to respond");
      }
      throw error;
    }

    throw new Error("Unknown error during analysis");
  }
};
