import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import {
  BrainCircuit,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Clapperboard,
  Film,
  Gem,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface ChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (query: string) => Promise<ChatMessage>;
  onToggleLike?: (movieId: number) => void;
  likedMovieIds?: number[];
}

export const ChatbotDrawer: React.FC<ChatbotDrawerProps> = ({
  isOpen,
  onClose,
  onSendMessage,
  onToggleLike,
  likedMovieIds = []
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'bot',
      text: 'Hello! I am your CinePredict Grounded AI Assistant. Ask me about SHAP drivers, failure risks, model comparisons, signal conflicts, data provenance, or movie recommendations.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setLoading(true);

    try {
      const botResponse = await onSendMessage(textToSend);
      setMessages(prev => [...prev, botResponse]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'bot',
          text: 'Sorry, I encountered a temporary network issue analyzing dataset intent.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePills = [
    'Why do movies succeed?',
    'Why might this movie fail?',
    'Show data provenance',
    'Check signal conflict',
    'Compare Model A vs Model B',
    'Recommend sci-fi like Inception'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end font-sans">
      <div className="w-full max-w-lg bg-[#050505] border-l border-[#262626] h-full flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-[#262626] bg-[#0B0B0B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-500">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2 font-display">
                CinePredict AI Assistant
                <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-[#E50914] text-white">
                  GROUNDED
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">TMDB 5000 Intent Router & SHAP Analytics</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#141414] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'bot' && (
                <div className="w-7 h-7 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] space-y-2 ${
                msg.sender === 'user' ? 'text-right' : 'text-left'
              }`}>
                
                {/* Bubble */}
                <div className={`inline-block p-3.5 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-[#E50914] text-white font-medium rounded-tr-none'
                    : 'bg-[#141414] border border-[#262626] text-neutral-200 rounded-tl-none space-y-2'
                }`}>
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                </div>

                {/* Grounded Data Previews inside Bot Message */}
                {msg.groundedData && msg.sender === 'bot' && (
                  <div className="mt-2 space-y-2 bg-[#0B0B0B] p-3 rounded-xl border border-[#262626]">
                    <p className="text-[11px] font-mono font-bold text-red-500 uppercase tracking-wider">
                      {msg.groundedData.title || 'Dataset Insights'}
                    </p>

                    {/* Grounded SHAP Items */}
                    {msg.groundedData.type === 'shap' && msg.groundedData.items && (
                      <div className="space-y-1.5 pt-1">
                        {msg.groundedData.items.map((item: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-[11px] p-1.5 rounded bg-[#141414]">
                            <span className="text-neutral-300">{item.displayName}</span>
                            <span className="font-mono text-red-400 font-bold">{(item.score * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Grounded Movies List */}
                    {msg.groundedData.type === 'movies' && msg.groundedData.items && (
                      <div className="grid grid-cols-1 gap-2 pt-1">
                        {msg.groundedData.items.slice(0, 3).map((item: any, i: number) => (
                          <div key={i} className="p-2 rounded-lg bg-[#141414] border border-[#262626] flex justify-between items-center text-[11px]">
                            <div>
                              <p className="font-bold text-white">{item.title} ({item.release_year})</p>
                              <p className="text-[10px] text-red-400/90">{item.reason}</p>
                            </div>
                            <span className="text-xs font-bold text-amber-400 font-mono">
                              ★ {item.vote_average}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Grounded Model Comparison */}
                    {msg.groundedData.type === 'model_compare' && (
                      <div className="p-2.5 rounded-lg bg-[#141414] border border-amber-900/40 text-[11px] space-y-1">
                        <p className="text-neutral-200 font-semibold">Audit Result:</p>
                        <p className="text-amber-300">{msg.groundedData.summaryStats?.leakageWarning || 'Pre-release Model A verified.'}</p>
                      </div>
                    )}

                  </div>
                )}

                <p className="text-[9px] font-mono text-neutral-500 px-1">{msg.timestamp}</p>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-[#181818] text-neutral-300 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 text-xs text-neutral-400 items-center">
              <Bot className="w-4 h-4 text-red-500 animate-spin" />
              <span className="font-mono">Routing query against dataset...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="p-3 bg-[#0B0B0B] border-t border-[#262626] overflow-x-auto flex gap-1.5 no-scrollbar">
          {samplePills.map((pill, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(pill)}
              className="px-2.5 py-1 rounded-full bg-[#141414] hover:bg-[#181818] text-red-400 border border-[#262626] text-[11px] whitespace-nowrap transition-colors"
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-3 bg-[#0B0B0B] border-t border-[#262626]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about SHAP drivers, failure risks, or scenarios..."
              className="flex-1 bg-[#141414] border border-[#262626] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="p-2.5 rounded-xl bg-[#E50914] text-white hover:bg-[#B20710] disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
