import Groq from "groq-sdk";

const truncate = (str = "", max = 600) =>
  str.length > max ? str.slice(0, max) + "…" : str;

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  return new Groq({ apiKey });
};

const getModel = () =>
  process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

/**
 * Returns:
 * {
 *   score,
 *   matchedSkills,
 *   missingSkills,
 *   summary,
 *   tip
 * }
 */
export const getAISkillAnalysis = async ({ job, user }) => {
  const groq = getGroqClient();
  const MODEL = getModel();

  const systemPrompt =
    "You are a career-fit assistant inside a job portal. " +
    "Evaluate how well a candidate fits a job. " +
    "Return ONLY valid JSON in this exact format: " +
    '{"score":0,"matchedSkills":[],"missingSkills":[],"summary":"","tip":""}';

  const userPrompt = `
JOB
Title: ${job.title}
Company: ${job.company}
Skills: ${job.tags?.join(", ") || "None"}
Experience: ${job.experience || "Not specified"}

Description:
${truncate(job.description)}

Requirements:
${truncate(job.requirements || "")}

CANDIDATE

Skills:
${user.skills?.join(", ") || "None"}

About:
${truncate(user.about || "", 300)}

Education:
${
  user.education?.degree
    ? `${user.education.degree} - ${user.education.institute || ""}`
    : "Not specified"
}
`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content;

    if (!raw) {
      throw new Error("Empty response from Groq");
    }

    const parsed = JSON.parse(raw);

    return {
      score: Math.max(
        0,
        Math.min(100, Math.round(Number(parsed.score) || 0))
      ),
      matchedSkills: Array.isArray(parsed.matchedSkills)
        ? parsed.matchedSkills
        : [],
      missingSkills: Array.isArray(parsed.missingSkills)
        ? parsed.missingSkills
        : [],
      summary:
        typeof parsed.summary === "string"
          ? parsed.summary
          : "No summary available.",
      tip:
        typeof parsed.tip === "string"
          ? parsed.tip
          : "No suggestions available.",
    };
  } catch (error) {
    console.error("========== GROQ ERROR ==========");
    console.error(error);
    console.error("================================");
    throw error;
  }
};