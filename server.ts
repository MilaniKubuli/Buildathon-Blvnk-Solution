import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI Client lazily/safely
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Municipal Dispatch AI Analysis Endpoint
  app.post('/api/analyze-report', async (req, res) => {
    const startTime = Date.now();
    try {
      const { newReport, existingIncidents } = req.body;

      if (!newReport || typeof newReport !== 'string' || !newReport.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Input text ("newReport") is required.',
        });
      }

      const incidentsArray = Array.isArray(existingIncidents)
        ? existingIncidents
        : [];

      const systemInstruction = `You are an intelligent, analytical municipal dispatch AI assistant.
Analyze the input text ("New_Report") and compare it against the provided JSON array ("Existing_Incidents").
Extract the location, assess the urgency (low, medium, high), and categorize the incident into one of these exact strings: "water_leak", "electricity_outage", "pothole_traffic", "illegal_dumping", "sewage_overflow", "fallen_tree", or "missing_manhole".
Identify if the new report is a possible duplicate based on overlapping locations and categories, and explain your reasoning.
If the location or incident type is too vague, do not invent details; return null and formulate a relevant clarification question.

Return ONLY a valid, raw JSON object using this exact schema:
{
  "category": "string or null",
  "location": "string or null",
  "urgency": "string",
  "short_summary": "string",
  "clarification_question": "string or null",
  "possible_duplicate": boolean,
  "matched_incident_ids": ["array of strings"],
  "duplicate_reasoning": "string or null"
}

Tone: Highly objective, logical, and strictly data-driven. Do not include conversational filler, markdown code blocks, or introductory text.`;

      const promptContent = `New_Report:
${newReport.trim()}

Existing_Incidents:
${JSON.stringify(incidentsArray, null, 2)}`;

      const ai = getGeminiClient();

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: promptContent,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description:
                  'One of: water_leak, electricity_outage, pothole_traffic, illegal_dumping, sewage_overflow, fallen_tree, missing_manhole, or null if vague.',
              },
              location: {
                type: Type.STRING,
                description:
                  'Extracted specific location string, or null if too vague or missing.',
              },
              urgency: {
                type: Type.STRING,
                description: 'Assessed urgency level: low, medium, or high.',
              },
              short_summary: {
                type: Type.STRING,
                description:
                  'Concise 1-sentence objective summary of the reported issue.',
              },
              clarification_question: {
                type: Type.STRING,
                description:
                  'Specific clarification question to ask citizen if location or category is null, else null.',
              },
              possible_duplicate: {
                type: Type.BOOLEAN,
                description:
                  'True if report matches category and overlapping location of an existing incident.',
              },
              matched_incident_ids: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  'Array of matched existing incident IDs (e.g. ["INC-101"]).',
              },
              duplicate_reasoning: {
                type: Type.STRING,
                description:
                  'Objective logical explanation of duplicate evaluation, or null if not duplicate.',
              },
            },
            required: [
              'urgency',
              'short_summary',
              'possible_duplicate',
              'matched_incident_ids',
            ],
          },
        },
      });

      const rawText = response.text || '';
      let parsedResult;

      try {
        parsedResult = JSON.parse(rawText.trim());
      } catch (parseErr) {
        // Fallback clean markdown codeblocks if any
        const cleaned = rawText
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();
        parsedResult = JSON.parse(cleaned);
      }

      // Ensure mandatory fields exist and types are clean
      const sanitized = {
        category: parsedResult.category || null,
        location: parsedResult.location || null,
        urgency: ['low', 'medium', 'high'].includes(parsedResult.urgency)
          ? parsedResult.urgency
          : 'medium',
        short_summary: parsedResult.short_summary || newReport.slice(0, 80),
        clarification_question: parsedResult.clarification_question || null,
        possible_duplicate: Boolean(parsedResult.possible_duplicate),
        matched_incident_ids: Array.isArray(parsedResult.matched_incident_ids)
          ? parsedResult.matched_incident_ids
          : [],
        duplicate_reasoning: parsedResult.duplicate_reasoning || null,
      };

      const processingTimeMs = Date.now() - startTime;

      res.json({
        success: true,
        data: sanitized,
        rawResponse: rawText,
        processingTimeMs,
        promptUsed: {
          systemInstruction,
          newReport,
          existingIncidents: incidentsArray,
        },
      });
    } catch (err: any) {
      console.error('Error during report analysis:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Internal server error processing report.',
      });
    }
  });

  // Vite development vs production handling
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Municipal Dispatch Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
