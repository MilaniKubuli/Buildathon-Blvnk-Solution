import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI Client
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

  // Call Groq Qwen API
  const analyzeWithGroqQwen = async (newReport: string, existingIncidents: any[], languageCode?: string) => {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) throw new Error('GROQ_API_KEY is not configured');

    const modelName = process.env.GROQ_MODEL || 'qwen-2.5-32b';

    const systemInstruction = `You are a state-of-the-art municipal dispatch AI reasoner for South African municipalities, powered by Groq Qwen 2.5.
Analyze the input report ("New_Report") and compare it against the JSON array ("Existing_Incidents").
Perform language detection across all 11 official South African languages (en, zu, xh, af, nso, tn, st, ts, ss, ve, nr).
If the report is not in English, provide an accurate English translation.
Extract the specific location, suburb/ward, nearest landmark, assess urgency (low, medium, high), and categorize into one of:
"water_leak", "electricity_outage", "pothole_traffic", "illegal_dumping", "sewage_overflow", "fallen_tree", or "missing_manhole".
Check for duplicates based on category and geographical location overlap.

Return ONLY a raw, valid JSON object matching this schema:
{
  "category": "string or null",
  "location": "string or null",
  "suburb": "string or null",
  "landmark": "string or null",
  "urgency": "low | medium | high",
  "short_summary": "string",
  "english_translation": "string or null",
  "clarification_question": "string or null",
  "possible_duplicate": boolean,
  "matched_incident_ids": ["array of strings"],
  "duplicate_reasoning": "string or null",
  "detected_language": {
    "code": "en | zu | xh | af | nso | tn | st | ts | ss | ve | nr",
    "name": "Full Language Name",
    "confidence": number_between_0_and_1
  }
}`;

    const promptContent = `New_Report:
${newReport.trim()}

Target_Language_Context: ${languageCode || 'Auto-detect'}

Existing_Incidents:
${JSON.stringify(existingIncidents, null, 2)}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: promptContent },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error ${response.status}: ${errText}`);
    }

    const jsonRes = await response.json();
    const rawText = jsonRes.choices?.[0]?.message?.content || '{}';
    return { rawText, modelUsed: modelName };
  };

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGroqKey: Boolean(process.env.GROQ_API_KEY),
      groqModel: process.env.GROQ_MODEL || 'qwen-2.5-32b',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      hasSupabaseUrl: Boolean(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL),
      timestamp: new Date().toISOString(),
    });
  });

  // Municipal Dispatch AI Analysis Endpoint
  app.post('/api/analyze-report', async (req, res) => {
    const startTime = Date.now();
    try {
      const { newReport, existingIncidents, languageCode } = req.body;

      if (!newReport || typeof newReport !== 'string' || !newReport.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Input text ("newReport") is required.',
        });
      }

      const incidentsArray = Array.isArray(existingIncidents) ? existingIncidents : [];
      let rawText = '';
      let provider = 'Groq Qwen AI';
      let modelUsed = process.env.GROQ_MODEL || 'qwen-2.5-32b';

      // Prefer Groq Qwen API if key is present
      if (process.env.GROQ_API_KEY) {
        try {
          const groqRes = await analyzeWithGroqQwen(newReport, incidentsArray, languageCode);
          rawText = groqRes.rawText;
          modelUsed = groqRes.modelUsed;
        } catch (groqErr: any) {
          console.warn('Groq Qwen API failed, falling back to Gemini:', groqErr.message);
          provider = 'Gemini 3.6 Flash';
        }
      } else {
        provider = 'Gemini 3.6 Flash (Groq fallback)';
      }

      // If rawText still empty (no Groq key or Groq error), use Gemini
      if (!rawText && process.env.GEMINI_API_KEY) {
        const ai = getGeminiClient();
        const systemInstruction = `You are an intelligent municipal dispatch AI assistant with South African 11 official languages support.
Analyze the report and extract category, location, suburb, landmark, urgency (low, medium, high), short summary, English translation (if original is not English), clarification questions, duplicate status against existing incidents, and detected language code.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: `Report:\n${newReport}\n\nExisting:\n${JSON.stringify(incidentsArray)}`,
          config: { systemInstruction, responseMimeType: 'application/json' },
        });

        rawText = response.text || '';
        modelUsed = 'gemini-3.6-flash';
      }

      // Clean & parse JSON result
      let parsedResult: any = {};
      try {
        parsedResult = JSON.parse(rawText.trim());
      } catch (parseErr) {
        const cleaned = rawText
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();
        parsedResult = JSON.parse(cleaned || '{}');
      }

      // Fallback heuristics if missing fields
      const sanitized = {
        category: parsedResult.category || null,
        location: parsedResult.location || null,
        suburb: parsedResult.suburb || null,
        landmark: parsedResult.landmark || null,
        urgency: ['low', 'medium', 'high'].includes(parsedResult.urgency)
          ? parsedResult.urgency
          : 'medium',
        short_summary: parsedResult.short_summary || newReport.slice(0, 100),
        english_translation: parsedResult.english_translation || null,
        clarification_question: parsedResult.clarification_question || null,
        possible_duplicate: Boolean(parsedResult.possible_duplicate),
        matched_incident_ids: Array.isArray(parsedResult.matched_incident_ids)
          ? parsedResult.matched_incident_ids
          : [],
        duplicate_reasoning: parsedResult.duplicate_reasoning || null,
        detected_language: parsedResult.detected_language || {
          code: languageCode || 'en',
          name: 'South African Official Language',
          confidence: 0.95,
        },
        ai_provider: provider,
        ai_model: modelUsed,
      };

      const processingTimeMs = Date.now() - startTime;

      res.json({
        success: true,
        data: sanitized,
        rawResponse: rawText,
        processingTimeMs,
        promptUsed: {
          systemInstruction: `Groq Qwen 2.5 / Gemini Municipal Dispatch Prompt`,
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

  app.listen(PORT, () => {
    console.log(`Municipal Dispatch Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
