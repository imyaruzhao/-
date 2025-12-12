import { GoogleGenAI } from "@google/genai";
import { ResearchResult, ReportSection, Source } from "../types";
import { SECTION_HEADERS } from "../constants";

const getSystemInstruction = () => `
You are a World-Class Global HR & Legal Consultant, specializing in helping Chinese companies expand overseas. 
Your goal is to explain local employment policies to a Chinese audience, highlighting specific cultural and legal differences compared to Mainland China.

User Context:
- Source Country: China (Mainland)
- Target Audience: HR Managers and Executives of Chinese background.

Task:
Research the specific employment policy or question provided by the user for the target Country and Industry(ies).

CRITICAL CITATION RULE (MANDATORY):
You MUST provide inline citations for EVERY factual claim, law, statistic, cultural insight, or practice you mention.
DO NOT list sources only at the end. You must embed them in the text immediately after the fact.
Format: [Source Name](URL)
Example: "The minimum wage is 12 EUR [German Gov](https://government.de/wage)."

Output Structure (Strict Markdown):
You must structure your response using exactly these Level 2 Markdown headers. Do not change the text of the headers.

${SECTION_HEADERS.CONCEPT}
[**OPTIONAL**: Only include this section if the user's question implies a specific Chinese concept (e.g. '13th month pay', 'housing fund', 'probation extension') that does not exist or works completely differently in the target location. If the question is standard or general, SKIP this header and section entirely. **Support with inline [Source](url) citations if included.**]

${SECTION_HEADERS.LEGAL}
[Is it mandatory? What are the hard laws? Minimum standards? **MUST contain multiple inline [Source](url) citations.**]

${SECTION_HEADERS.PRACTICE}
[What do most companies actually do? Local vs MNC differences? Trends? **MUST contain inline [Source](url) citations.**]

${SECTION_HEADERS.CULTURE}
[How do employees feel about this? Is it a privacy issue? A trust issue? **MUST contain inline [Source](url) citations.**]

${SECTION_HEADERS.ADVICE}
[Three distinct sub-points: 
1. Safest/100% Compliant. 
2. Local Norm. 
3. Balanced Approach for Chinese companies.]

Tone: Professional, Insightful, Energetic, Direct. Use formatting like bullet points and bold text to make it readable.
`;

export const fetchPolicyResearch = async (
  country: string,
  industries: string[],
  query: string
): Promise<ResearchResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Target Country: ${country}
    Target Industries: ${industries.join(", ")}
    User Question: ${query}
    
    Please provide a detailed research report with the defined structure. 
    IMPORTANT: Every section MUST have inline citations [Source Name](URL) for facts/laws/insights.
    **Skip the Concept Correction section if there is no significant Chinese vs Local concept clash.**
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(),
        tools: [{ googleSearch: {} }], 
      },
    });

    const markdown = response.text || "No content generated.";
    
    // Extract Grounding Sources
    const sources: Source[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri,
          });
        }
      });
    }

    // Parse Markdown into Sections
    const sections: ReportSection[] = parseMarkdownToSections(markdown);

    return {
      markdown,
      sections,
      sources,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

const parseMarkdownToSections = (markdown: string): ReportSection[] => {
  const result: ReportSection[] = [];
  
  // Helper to find content between headers
  const extractContent = (header: string, nextHeaders: string[]) => {
    const startIndex = markdown.indexOf(header);
    if (startIndex === -1) return "";
    
    const contentStart = startIndex + header.length;
    let contentEnd = markdown.length;
    
    // Find the nearest next header
    let nearestNextIndex = markdown.length;
    for (const next of nextHeaders) {
      const idx = markdown.indexOf(next);
      if (idx !== -1 && idx > startIndex && idx < nearestNextIndex) {
        nearestNextIndex = idx;
      }
    }
    contentEnd = nearestNextIndex;
    
    return markdown.slice(contentStart, contentEnd).trim();
  };

  const headers = Object.values(SECTION_HEADERS);

  // 1. Concept
  const conceptContent = extractContent(SECTION_HEADERS.CONCEPT, headers);
  // Only add if content exists and is not just "None" or "N/A"
  if (conceptContent && conceptContent.length > 5 && !conceptContent.match(/^(none|n\/a|not applicable)$/i)) {
    result.push({
      id: 'concept',
      title: '概念差异矫正',
      icon: '🧠',
      content: conceptContent,
      color: 'bg-orange-50 border-orange-200 text-orange-900'
    });
  }

  // 2. Legal
  const legalContent = extractContent(SECTION_HEADERS.LEGAL, headers);
  if (legalContent) {
    result.push({
      id: 'legal',
      title: '基础法律要求',
      icon: '⚖️',
      content: legalContent,
      color: 'bg-red-50 border-red-200 text-red-900'
    });
  }

  // 3. Practice
  const practiceContent = extractContent(SECTION_HEADERS.PRACTICE, headers);
  if (practiceContent) {
    result.push({
      id: 'practice',
      title: '当地企业实践',
      icon: '🏢',
      content: practiceContent,
      color: 'bg-blue-50 border-blue-200 text-blue-900'
    });
  }

  // 4. Culture
  const cultureContent = extractContent(SECTION_HEADERS.CULTURE, headers);
  if (cultureContent) {
    result.push({
      id: 'culture',
      title: '文化与预期',
      icon: '🤝',
      content: cultureContent,
      color: 'bg-purple-50 border-purple-200 text-purple-900'
    });
  }

  // 5. Advice
  const adviceContent = extractContent(SECTION_HEADERS.ADVICE, headers);
  if (adviceContent) {
    result.push({
      id: 'advice',
      title: '执行建议',
      icon: '💡',
      content: adviceContent,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-900'
    });
  }

  return result;
};