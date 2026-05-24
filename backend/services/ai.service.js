const { GoogleGenAI } = require("@google/genai");

let ai = null;

function getAIClient() {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set. Falling back to mock AI generation.");
      return null;
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

exports.generateInsights = async (transcript, meetingTitle) => {
  const client = getAIClient();

  if (!client) {
    // Fallback if no API key is provided
    const summary = `Meeting "${meetingTitle}" covered ${transcript.split("\n").length} discussion points. Key outcomes: team aligned on priorities, clear ownership assigned, and positive momentum toward deliverables. Recommended follow-up within 48 hours to maintain velocity.`;
    return {
      summary,
      actionItems: [
        { title: "Review meeting notes and confirm next steps", status: "todo" },
        { title: "Share summary with stakeholders", status: "todo" }
      ],
      sentimentScore: 85,
    };
  }

  const prompt = `
  You are an expert meeting assistant. Please analyze the following meeting transcript for a meeting titled "${meetingTitle}".
  
  Transcript:
  """
  ${transcript}
  """

  Provide your analysis strictly as a JSON object with the following schema:
  {
    "summary": "A cohesive 2-3 sentence summary of the meeting",
    "actionItems": [
      { "title": "Specific action item", "status": "todo" }
    ],
    "sentimentScore": 85 // A number from 0 to 100 indicating the overall positivity and productivity of the meeting
  }
  
  Do not include any markdown formatting like \`\`\`json. Return only the raw JSON string.
  `;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    const parsed = JSON.parse(text);

    return {
      summary: parsed.summary || "Summary generation failed.",
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
      sentimentScore: typeof parsed.sentimentScore === "number" ? parsed.sentimentScore : 75,
    };
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate AI insights");
  }
};
