import { useGeminiKey } from '../hooks/useGeminiKey';
import { useState } from 'react';

export default function GeminiKeyBanner() {
  const { hasKey, saveKey } = useGeminiKey();
  const [draft, setDraft] = useState('');
  const [show, setShow] = useState(true);

  if (hasKey || !show) return null;

  return (
    <div
      className="p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6"
      style={{
        background: 'rgba(251, 191, 36, 0.08)',
        borderColor: 'rgba(251, 191, 36, 0.3)',
      }}
    >
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#FBBF24]">⚠ No Gemini API Key</p>
        <p className="text-xs text-[#A7ADBA] mt-0.5">
          Paste your key to enable AI features.{' '}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-[#A78BFA] underline"
          >
            Get one free →
          </a>
        </p>
      </div>
      <div className="flex gap-2">
        <input
          type="password"
          placeholder="AIza..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs bg-[#1B1E27] border border-[#282D38] text-[#F5F7FA] w-44"
        />
        <button
          onClick={() => { if (draft.trim()) { saveKey(draft); setDraft(''); } }}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#8B5CF6] text-white"
        >
          Save
        </button>
        <button
          onClick={() => setShow(false)}
          className="px-2 py-1.5 rounded-lg text-xs text-[#737B8C] hover:text-[#F5F7FA]"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
