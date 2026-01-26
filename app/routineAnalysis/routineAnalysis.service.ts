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

  return `You are a professional fitness coach analyzing workout performance.

CRITICAL: Respond ENTIRELY in ${lang.toUpperCase()}. ALL text content (feedback, strengths, improvements, suggestions, nextSteps) MUST be written in ${lang}.

Return ONLY valid JSON with this structure (no additional text):
{
  "overallScore": number (0-100),
  "overallFeedback": "2-3 sentence summary in ${lang}",
  "strengths": ["strength 1 in ${lang}", "strength 2 in ${lang}"],
  "improvements": ["improvement 1 in ${lang}", "improvement 2 in ${lang}"],
  "exercises": [
    {
      "exerciseId": "exercise-id",
      "performanceScore": number (0-100),
      "feedback": "1-2 sentences in ${lang}",
      "suggestions": ["tip 1 in ${lang}", "tip 2 in ${lang}"]
    }
  ],
  "nextSteps": ["goal 1 in ${lang}", "goal 2 in ${lang}", "goal 3 in ${lang}"]
}

CRITICAL - Scoring criteria (performanceScore):
1. Rep completion (40%): Compare actual vs target reps
2. Exercise tempo/timing (40%): MOST IMPORTANT - Analyze if duration is realistic and healthy based on exercise type
   - You will receive roundDetails array with timePerRep for EACH round
   - Analyze tempo consistency across rounds and flag significant variations
   - Healthy tempo ranges by exercise (time per rep):
     * squats: 2-4 seconds (1.5-2s down, brief pause, 1s up - full depth critical)
     * pushups: 2-4 seconds (1-1.5s down controlled, explosive up - chest to ground)
     * lunges: 2-4 seconds per rep (single leg cycle - 1.5s down, brief pause, 1s up - count each leg)
     * lateral-raises: 1.5-3.5 seconds (1s lift, 1.5-2.5s controlled lowering for shoulder safety)
     * hammer-curls: 1.5-3.5 seconds PER ARM (if alternating - 1s up, 1.5-2.5s eccentric)
     * calf-raises: 1-3 seconds (quick squeeze at top, controlled stretch at bottom)
     * standing-leg-raises: 1.5-3.5 seconds PER LEG (if alternating - controlled lift and lower each leg)
   
   - RED FLAGS by tempo (reduce score heavily):
     * Under 1.5 sec/rep: Rushing, dangerous form, not achieving full range of motion, momentum instead of muscle
     * Under 2 sec for squats/lunges: Not going deep enough, partial reps
     * Over 6 sec/rep: Excessive rest between reps, losing muscle tension
     * 20 reps in 5-15 seconds: Physically impossible with proper form, likely counting errors or partial reps
   
3. Consistency (20%): Use roundDetails to analyze performance across rounds
   - Check if reps and timePerRep are consistent across rounds
   - Flag if later rounds show significant fatigue (50%+ slower tempo or 30%+ fewer reps)
   - Reward consistent performance throughout all rounds

Score guidelines by exercise:
- 90-100: Met/exceeded targets + healthy tempo for that exercise + good consistency
- 75-89: Met targets but tempo slightly rushed (15-25% faster than ideal) or slow (15-25% slower)
- 60-74: Partial targets (70-90% completed) OR tempo issues (30-50% off ideal) but not both
- 40-59: Significant gaps in reps (50-70% completed) OR dangerous tempo (under 1.5s or over 6s)
- Below 40: Poor rep completion AND unhealthy/impossible tempo

In feedback, ALWAYS mention specific tempo analysis for that exercise and explain safety/effectiveness impact.`;
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
