import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  X, 
  RefreshCw, 
  ShieldAlert,
  Bot,
  User,
  Info
} from 'lucide-react';
import { Medicine, ChatMessage } from '../types';

interface MedicineChatbotProps {
  medicine: Medicine;
  onClose: () => void;
}

export const MedicineChatbot: React.FC<MedicineChatbotProps> = ({
  medicine,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello. I am your MediCheck clinical assistant for ${medicine.brand_name} (${medicine.strength}). You can ask me about approved indications, pharmacological mechanisms, precautions, side effects, or food guidelines.`,
      timestamp: 'Just now',
    },
  ]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const predefinedPrompts = [
    'What is this medicine used for?',
    'Can I take it with food?',
    'What are common side effects?',
    'Is it safe to consume with alcohol?',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await fetch('/api/medicine-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          medicine: medicine,
        }),
      });

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || 'Consult your prescribing doctor for specific advice.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: `For ${medicine.brand_name}, clinical guidance recommends taking it strictly as prescribed. Food interaction note: ${medicine.food_information}. Please consult your physician for individualized care.`,
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl">
      <div className="relative flex flex-col h-[85vh] w-full max-w-xl rounded-3xl tech-card shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden font-minimal">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#00e599]/15 bg-black/50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00e599] text-black shadow-[0_0_15px_rgba(0,229,153,0.3)]">
              <Bot className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{medicine.brand_name} Assistant</h3>
                <span className="rounded bg-[#00e599]/20 px-1.5 py-0.2 text-[9px] font-mono-tag font-bold text-[#00e599] border border-[#00e599]/30">
                  CLINICAL INTEL
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono-tag truncate max-w-xs">
                {medicine.strength}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Clinical Guardrail Banner */}
        <div className="border-b border-[#00e599]/10 bg-[#00e599]/[0.04] px-4 py-2 text-[11px] text-zinc-300 flex items-center gap-2 font-mono-tag">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-[#00e599]" />
          <span>Clinical protocol active: Strictly grounded in approved pharmaceutical data.</span>
        </div>

        {/* Chat message history */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-[#00e599] text-black font-bold'
                    : 'bg-white/10 text-[#00e599]'
                }`}
              >
                {msg.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              </div>

              <div
                className={`rounded-2xl px-4 py-3 text-xs leading-relaxed max-w-[82%] ${
                  msg.sender === 'user'
                    ? 'bg-[#00e599] text-black font-semibold'
                    : 'border border-[#00e599]/15 bg-black/50 text-zinc-200'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono-tag pl-10">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#00e599]" />
              <span>Analyzing pharmacological knowledge base...</span>
            </div>
          )}
        </div>

        {/* Quick prompt pills */}
        <div className="border-t border-white/[0.06] bg-black/40 px-4 py-2.5 overflow-x-auto no-scrollbar flex items-center gap-2 font-minimal">
          {predefinedPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] hover:border-[#00e599]/40 hover:text-white px-3 py-1.5 text-[11px] text-zinc-300 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="border-t border-white/[0.08] bg-black/70 p-3 sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 font-minimal"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask about ${medicine.brand_name} uses, food, side effects...`}
              className="flex-1 rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#00e599] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="flex h-10 w-10 items-center justify-center rounded-xl tech-button-mint text-black disabled:opacity-40 transition-all shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
