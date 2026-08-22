let aiStatusSetter = null;

export function setAiStatusHandler(fn) {
  aiStatusSetter = fn;
}

export function getGeminiApiKey() {
  return (
    localStorage.getItem('careeros_gemini_key') ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    ''
  );
}

export async function callGemini(systemPrompt, userPrompt) {
  const customKey = getGeminiApiKey();

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (customKey) {
      headers['x-gemini-key'] = customKey;
    }

    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers,
      body: JSON.stringify({ systemPrompt, userPrompt }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.text) {
        if (aiStatusSetter) aiStatusSetter(true);
        return data.text;
      }
    }

    // Direct client-side fallback if backend proxy endpoint fails
    if (!customKey) {
      if (aiStatusSetter) aiStatusSetter(false);
      throw new Error('Gemini API key missing. Please save key in top banner.');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${customKey}`;
    const body = {
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
    };
    if (systemPrompt) body.systemInstruction = { parts: [{ text: systemPrompt }] };

    const directRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!directRes.ok) {
      const errBody = await directRes.json().catch(() => ({}));
      throw new Error(errBody?.error?.message || `Gemini API returned status ${directRes.status}`);
    }

    const data = await directRes.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response content from Gemini API');

    if (aiStatusSetter) aiStatusSetter(true);
    return text;
  } catch (err) {
    if (aiStatusSetter) aiStatusSetter(false);
    throw err;
  }
}

// Alias callClaude to callGemini to route all existing calls to Gemini API
export const callClaude = callGemini;
