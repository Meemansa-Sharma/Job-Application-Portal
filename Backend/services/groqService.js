import Groq from "groq-sdk";

// If GROQ_API_KEY isn't set, we still want the rest of the app to work -
// the controller that calls this falls back to the deterministic match.
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

// Model note: Groq has been retiring some of the older Llama models (e.g.
// llama-3.1-8b-instant is slated for shutdown). openai/gpt-oss-20b is a
// solid current default - fast, cheap, and supports JSON mode, which is all
// this feature needs. Override via GROQ_MODEL if you'd rather use something
// else (check https://console.groq.com/docs/models for the current list).
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

// Keep prompts short - cheaper, faster, and avoids blowing context on a giant
// pasted job description or "about me".
const truncate = (str = "", max = 600) => (str.length > max ? str.slice(0, max) + "…" : str);

/**
 * Asks Groq to evaluate how well a seeker's profile fits a job, and to
 * explain it in plain language (not just a percentage).
 * Returns: { score, matchedSkills, missingSkills, summary, tip }
 * Throws on any failure - the caller decides how to fall back.
 */
export const getAISkillAnalysis = async ({ job, user }) => {
  if (!groq) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const systemPrompt =
    "You are a career-fit assistant inside a job portal. Given a job and a candidate's profile, " +
    "evaluate the fit honestly and helpfully. Respond with ONLY a JSON object, no markdown fences, " +
    "no commentary outside the JSON, matching exactly this shape: " +
    '{"score": <integer 0-100>, "matchedSkills": [<strings from the job\'s tags the candidate has>], ' +
    '"missingSkills": [<strings from the job\'s tags the candidate lacks>], ' +
    '"summary": "<1-2 sentence honest assessment of fit>", ' +
    '"tip": "<1 short actionable tip to improve their chances for this specific job>"}';

  const userPrompt = `
JOB
Title: ${job.title}
Company: ${job.company}
Required/desired skills (tags): ${job.tags?.length ? job.tags.join(", ") : "none listed"}
Experience level: ${job.experience || "not specified"}
Description: ${truncate(job.description)}
${job.requirements ? `Requirements: ${truncate(job.requirements)}` : ""}

CANDIDATE
Skills: ${user.skills?.length ? user.skills.join(", ") : "none listed"}
About: ${truncate(user.about || "not provided", 300)}
Education: ${user.education?.degree ? `${user.education.degree}, ${user.education.institute || ""}` : "not provided"}
`.trim();

  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.3,
    max_tokens: 400,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Empty response from Groq");

  const parsed = JSON.parse(raw); // throws if the model didn't return valid JSON - caller catches it

  // clamp/sanitize so a weird model response can't break the frontend
  return {
    score: Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0))),
    matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
    missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
    tip: typeof parsed.tip === "string" ? parsed.tip : "",
  };
};
