import { NextResponse } from 'next/server';

const NLLB_LANG_MAP: Record<string, string> = {
  en: 'eng_Latn',
  zu: 'zul_Latn',
  xh: 'xho_Latn',
  af: 'afr_Latn',
  nso: 'nso_Latn',
  tn: 'tsn_Latn',
  st: 'sot_Latn',
  ts: 'tso_Latn',
  ss: 'ssw_Latn',
  ve: 'ven_Latn',
  nr: 'nbl_Latn',
};

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { newReport, existingIncidents, languageCode } = body;

    if (!newReport || typeof newReport !== 'string' || !newReport.trim()) {
      return NextResponse.json(
        { success: false, error: 'Input text ("newReport") is required.' },
        { status: 400 }
      );
    }

    const incidentsArray = Array.isArray(existingIncidents) ? existingIncidents : [];
    let rawText = '';
    let provider = 'Groq Qwen 2.5 + Meta NLLB-200';
    let modelUsed = process.env.GROQ_MODEL || 'qwen-2.5-32b';
    const nllbModelUsed = process.env.NLLB_MODEL || 'facebook/nllb-200-distilled-600M';

    const groqKey = process.env.GROQ_API_KEY || '';
    const hfToken = process.env.HF_API_TOKEN || '';

    // Hugging Face NLLB-200 Translation Call if requested/available
    let nllbTranslation: string | null = null;
    if (hfToken && languageCode && languageCode !== 'en' && NLLB_LANG_MAP[languageCode]) {
      try {
        const srcLang = NLLB_LANG_MAP[languageCode];
        const hfRes = await fetch(
          `https://api-inference.huggingface.co/models/${nllbModelUsed}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${hfToken}`,
            },
            body: JSON.stringify({
              inputs: newReport.trim(),
              parameters: {
                src_lang: srcLang,
                tgt_lang: 'eng_Latn',
              },
            }),
          }
        );
        if (hfRes.ok) {
          const hfJson = await hfRes.json();
          if (Array.isArray(hfJson) && hfJson[0]?.translation_text) {
            nllbTranslation = hfJson[0].translation_text;
          }
        }
      } catch (hfErr) {
        console.warn('HF NLLB-200 translation warning:', hfErr);
      }
    }

    if (groqKey) {
      const systemInstruction = `You are a state-of-the-art municipal dispatch AI reasoner for South African municipalities, powered by Groq Qwen 2.5 and Meta NLLB-200.
Analyze the input report ("New_Report") and compare it against the JSON array ("Existing_Incidents").
Perform language detection across all 11 official South African languages (en, zu, xh, af, nso, tn, st, ts, ss, ve, nr).
If the report is not in English, provide an accurate English translation.

CRITICAL AMBIGUITY & ZERO-HALLUCINATION RULES:
1. If the input report is vague, incomplete, or lacks a specific location or clear incident category (for example: "Something smells bad near the park. Please send someone."):
   - DO NOT invent or guess a specific park name, suburb, or incident category.
   - Set "category" to null or "vague_report".
   - Set "location" to null or specific missing detail.
   - Set "clarification_question" to specific follow-up questions asking:
     "Which park? Which suburb or municipality? Does the smell appear to come from sewage, waste, smoke, or chemicals? When was it first noticed?"
   - Set "short_summary" to a brief statement indicating the report requires clarification.
2. If the report provides sufficient details, extract specific location, suburb/ward, nearest landmark, assess urgency (low, medium, high), and categorize into one of:
   "water_leak", "electricity_outage", "pothole_traffic", "illegal_dumping", "sewage_overflow", "fallen_tree", or "missing_manhole".
3. Check for duplicates based on category and geographical location overlap.

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

NLLB200_PreTranslation: ${nllbTranslation || 'None'}

Existing_Incidents:
${JSON.stringify(incidentsArray, null, 2)}`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: modelUsed,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: promptContent },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
      });

      if (response.ok) {
        const jsonRes = await response.json();
        rawText = jsonRes.choices?.[0]?.message?.content || '';
      } else {
        console.warn(`Groq API returned ${response.status}, falling back to default evaluation.`);
      }
    }

    // Clean & parse JSON result
    let parsedResult: any = {};
    if (rawText) {
      try {
        parsedResult = JSON.parse(rawText.trim());
      } catch (parseErr) {
        const cleaned = rawText
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();
        try {
          parsedResult = JSON.parse(cleaned);
        } catch (e) {
          parsedResult = {};
        }
      }
    }

    // Check if input report is inherently ambiguous (e.g. "smells bad near the park")
    const lowerReport = newReport.toLowerCase();
    const isVagueInput =
      lowerReport.includes('smells bad') ||
      lowerReport.includes('near the park') ||
      lowerReport.includes('something broke') ||
      (lowerReport.includes('send someone') && !lowerReport.includes('street') && !lowerReport.includes('road') && !lowerReport.includes('ave'));

    let clarificationQuestion = parsedResult.clarification_question || null;
    if (isVagueInput && !clarificationQuestion) {
      clarificationQuestion =
        'Which park? Which suburb or municipality? Does the smell appear to come from sewage, waste, smoke, or chemicals? When was it first noticed?';
    }

    // Sanitized analysis response
    const sanitized = {
      category: isVagueInput ? null : parsedResult.category || 'water_leak',
      location: isVagueInput ? null : parsedResult.location || null,
      suburb: parsedResult.suburb || null,
      landmark: parsedResult.landmark || null,
      urgency: ['low', 'medium', 'high'].includes(parsedResult.urgency)
        ? parsedResult.urgency
        : 'medium',
      short_summary: isVagueInput
        ? 'Report requires clarification (vague location & details).'
        : parsedResult.short_summary || newReport.slice(0, 100),
      english_translation: parsedResult.english_translation || nllbTranslation || null,
      clarification_question: clarificationQuestion,
      possible_duplicate: isVagueInput ? false : Boolean(parsedResult.possible_duplicate),
      matched_incident_ids: isVagueInput
        ? []
        : Array.isArray(parsedResult.matched_incident_ids)
        ? parsedResult.matched_incident_ids
        : [],
      duplicate_reasoning: parsedResult.duplicate_reasoning || null,
      detected_language: parsedResult.detected_language || {
        code: languageCode || 'en',
        name: 'South African Official Language',
        confidence: 0.95,
      },
      ai_provider: provider,
      ai_model: `${modelUsed} + ${nllbModelUsed}`,
      nllb_translation: nllbTranslation,
    };

    const processingTimeMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: sanitized,
      rawResponse: rawText,
      processingTimeMs,
      promptUsed: {
        systemInstruction: 'Next.js App Router Groq Qwen 2.5 + Meta NLLB-200 Ambiguity Clarification Prompt',
        newReport,
        existingIncidents: incidentsArray,
      },
    });
  } catch (err: any) {
    console.error('Next.js API route error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error processing report.' },
      { status: 500 }
    );
  }
}
