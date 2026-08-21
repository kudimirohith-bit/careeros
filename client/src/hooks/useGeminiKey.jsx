import { useState } from 'react';

const KEY_STORAGE = 'careeros_gemini_key';

export function useGeminiKey() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(KEY_STORAGE) || '');

  const saveKey = (key) => {
    localStorage.setItem(KEY_STORAGE, key.trim());
    setApiKey(key.trim());
  };

  const clearKey = () => {
    localStorage.removeItem(KEY_STORAGE);
    setApiKey('');
  };

  return { apiKey, saveKey, clearKey, hasKey: !!apiKey };
}
