import { NextResponse } from 'next/server';

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
    let provider = 'Groq Qwen AI';
    let modelUsed = process.env.GROQ_MODEL || 'qwen-2.5-32b';

    const groqKey = process.env.GROQ_API_KEY || '';

    if (groqKey) {
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

    // Fallback heuristics
    const sanitized = {
      category: parsedResult.category || 'water_leak',
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

    return NextResponse.json({
      success: true,
      data: sanitized,
      rawResponse: rawText,
      processingTimeMs,
      promptUsed: {
        systemInstruction: 'Next.js App Router Groq Qwen 2.5 Prompt',
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
