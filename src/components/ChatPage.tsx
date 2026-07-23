import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import PublicHeader from './PublicHeader';

type ChatMessage = {
  role: 'assistant' | 'user';
  text: string;
};

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Hi, I can help explain your lab results. Paste a value or a question to get started.',
    },
  ]);

  const canSend = input.trim().length > 0;

  const helperPrompt = useMemo(
    () =>
      isAuthenticated
        ? 'Your account can save progress and session history in your profile.'
        : 'Guest mode works for instant analysis and chat. Sign in when you want to save progress.',
    [isAuthenticated],
  );

  const handleSend = () => {
    const question = input.trim();
    if (!question) {
      return;
    }

    const assistantReply =
      'Thanks. Based on what you shared, focus on the trend over time and discuss any high or low values with your provider. If you share the exact value and reference range, I can explain it in more detail.';

    setMessages((current) => [
      ...current,
      { role: 'user', text: question },
      { role: 'assistant', text: assistantReply },
    ]);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-[#F2F7F4]">
      <PublicHeader activeSection="chat" />
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-6 py-10">
        <div className="rounded-2xl border border-[#8FD4A8]/40 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E7D55]">AI Chat</p>
              <h1 className="text-2xl font-bold text-[#1E3A2F]">Chat About Your Results</h1>
              <p className="mt-1 text-sm text-gray-500">{helperPrompt}</p>
            </div>

            <button
              onClick={() => navigate('/upload')}
              className="rounded-xl border border-[#8FD4A8] px-4 py-2 text-sm font-semibold text-[#1E3A2F] transition-colors hover:bg-[#E5F2EA]"
            >
              Upload Another Report
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-[#8FD4A8]/40 bg-white p-4 shadow-sm">
          <div className="max-h-[55vh] space-y-3 overflow-y-auto p-2">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === 'assistant'
                    ? 'bg-[#E5F2EA] text-[#1E3A2F]'
                    : 'ml-auto bg-[#1E3A2F] text-white'
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-end">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a question about your lab report..."
              className="min-h-24 w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-[#2E7D55] focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                canSend
                  ? 'bg-[#1E3A2F] text-white hover:bg-[#2E7D55]'
                  : 'bg-gray-100 text-gray-300'
              }`}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;