import { useState } from 'react';
import { api } from '../api/api';

export default function CoachChat({ studentId }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const userMsg = input.trim() || 'Give me a quick check-in';
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);
    try {
      const result = await api.getCoachMessage(studentId, userMsg);
      setMessages((prev) => [...prev, { role: 'coach', text: result.message }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'coach', text: 'Sorry, I couldn\'t connect. Try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        id="coach-chat-toggle"
        onClick={() => { setOpen(true); if (!messages.length) send(); }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#8B5CF6] text-white text-xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-50"
        title="AI Coach"
      >
        🤖
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 max-h-[28rem] rounded-2xl bg-[#171A22] border border-[#282D38] shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#282D38] bg-[#11131A]">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span className="text-sm font-bold text-[#F5F7FA]">AI Coach</span>
        </div>
        <button onClick={() => setOpen(false)} className="text-[#737B8C] hover:text-[#F5F7FA] text-sm">✕</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[12rem]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="px-3 py-2 rounded-xl text-xs leading-relaxed max-w-[85%]"
              style={{
                background: m.role === 'user' ? '#8B5CF6' : '#1B1E27',
                color: m.role === 'user' ? '#fff' : '#F5F7FA',
                border: m.role === 'user' ? 'none' : '1px solid #282D38',
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-xl bg-[#1B1E27] border border-[#282D38] text-xs text-[#737B8C]">
              <span className="animate-pulse">Thinking…</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#282D38] flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && send()}
          placeholder="Ask your coach..."
          className="flex-1 px-3 py-2 rounded-lg text-xs bg-[#1B1E27] border border-[#282D38] text-[#F5F7FA] placeholder-[#737B8C] focus:border-[#8B5CF6] focus:outline-none"
        />
        <button
          onClick={send}
          disabled={loading}
          className="px-3 py-2 rounded-lg text-xs font-semibold bg-[#8B5CF6] text-white disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
