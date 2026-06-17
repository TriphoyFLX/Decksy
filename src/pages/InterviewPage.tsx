import React, { useEffect, useRef } from "react";
import { Loader2, Megaphone, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Message, PitchCanvas, Mode } from "../types";

interface InterviewPageProps {
  mode: Mode;
  underlyingThoughts: string;
  currentSentiment: { bg: string; label: string };
  messages: Message[];
  isLoading: boolean;
  inputMessage: string;
  setInputMessage: (value: string) => void;
  handleSendMessage: () => void;
  sessionImages: any[];
  setSessionImages: React.Dispatch<React.SetStateAction<any[]>>;
  handleGenerateDeck: () => void;
  canvas: PitchCanvas;
}

export const InterviewPage: React.FC<InterviewPageProps> = ({
  mode,
  underlyingThoughts,
  currentSentiment,
  messages,
  isLoading,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  sessionImages,
  setSessionImages,
  handleGenerateDeck,
  canvas,
}) => {
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat area on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  return (
    <motion.div 
      id="screen-interview"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid lg:grid-cols-12 gap-6 py-2 overflow-hidden h-full max-h-[85vh]"
    >
      {/* LEFT COLUMN: INTERACTIVE CHAT WITH SENSORS (7 COLS) */}
      <div className="lg:col-span-7 flex flex-col justify-between bg-[#0D0D0F] border border-white/10 rounded-lg p-5 shadow-2xl relative overflow-hidden h-[75vh]">
        
        {/* Meeting Header with investor status */}
        <div className="border-b border-white/10 pb-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-lg text-slate-200 relative border border-white/10 flex-shrink-0">
              {mode === 'shark' ? '🦈' : '👔'}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border border-[#0D0D0F]"></span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-1.55">
                <span>ИИ-Инвестор</span>
                <span className="font-mono text-[9px] text-white bg-white/10 border border-white/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-tight">{mode} Mode</span>
              </h3>
              <p className="text-[11px] text-slate-500 truncate max-w-[200px] sm:max-w-xs font-mono">{underlyingThoughts}</p>
            </div>
          </div>

          {/* Sentiment Gauge Pill */}
          <div className={`text-xs border px-3 py-1.5 rounded-lg font-mono flex items-center space-x-1.5 ${currentSentiment.bg}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse"></span>
            <span>{currentSentiment.label}</span>
          </div>
        </div>

        {/* Chat bubbles area */}
        <div className="flex-grow overflow-y-auto py-4 space-y-6 px-2 my-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'user' ? (
                /* User Message Card style from Sophisticated Dark design */
                <div className="flex gap-4 max-w-[85%] ml-auto flex-row-reverse">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex-shrink-0 flex items-center justify-center border border-amber-400/30">
                    <span className="text-xs font-bold text-black font-mono uppercase">Me</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl rounded-tr-none border border-white/10">
                    <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{m.text}</div>
                    <span className="block text-[9px] text-slate-500 mt-1.5 text-right font-mono uppercase tracking-widest">
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              ) : (
                /* Investor Message Card style from Sophisticated Dark design */
                <div className="flex gap-4 max-w-[85%]">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center border border-white/20">
                    <span className="text-xs font-mono font-bold text-white">AI</span>
                  </div>
                  <div className="space-y-2 flex-grow">
                    <div className="bg-[#161618] p-4 rounded-xl rounded-tl-none border border-white/5">
                      <div className="text-sm leading-relaxed text-slate-100 whitespace-pre-line">{m.text}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-slate-500 font-mono">Critique Active</span>
                      <span className="text-[9px] text-slate-600 font-mono">{m.timestamp}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center border border-white/20 animate-pulse">
                <span className="text-xs font-mono font-bold text-white">AI</span>
              </div>
              <div className="bg-[#161618] p-4 rounded-xl rounded-tl-none border border-white/5 flex items-center space-x-2 text-slate-400 text-xs font-mono">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                <span>Инвестор анализирует ваш ответ...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Reply Area */}
        <div className="border-t border-white/10 pt-4 space-y-3">
          <div className="relative">
            <textarea
              id="interview-answer-input"
              rows={2}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ответьте по пунктам: • клиент • боль • цифры... (Enter — отправить)"
              className="w-full bg-[#161618] border border-white/10 rounded-lg p-4 pr-32 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-white/30 resize-none text-xs leading-relaxed font-sans"
            />
            <button
              id="send-answer-btn"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="absolute right-3 bottom-3.5 px-5 py-1.5 bg-white text-black font-bold uppercase text-[10px] rounded hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Send Answer
            </button>
          </div>
          
          {/* Image uploader region before presentation generation */}
          <div className="bg-[#121214] p-3 rounded-lg border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                🖼️ Изображения, Графики, QR к проекту
              </span>
              <label className="text-[9.5px] text-sky-400 hover:text-sky-300 font-mono font-semibold uppercase tracking-wider cursor-pointer flex items-center gap-1">
                <span>➕ Добавить изображение</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (typeof reader.result === 'string') {
                          setSessionImages(prev => [
                            ...prev, 
                            { 
                              id: `img_${Date.now()}`, 
                              image: reader.result, 
                              description: "Главный экран приложения" 
                            }
                          ]);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>

            {sessionImages.length === 0 ? (
              <p className="text-[9.5px] text-slate-600 italic">
                Нет загруженных картинок к проекту. Добавьте схемы, скриншоты продукта или QR-коды, чтобы ИИ автоматически включил их в презентацию.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
                {sessionImages.map((sImg, sIdx) => (
                  <div key={sImg.id} className="flex gap-2 bg-black/40 border border-white/10 p-2 rounded relative group">
                    <button
                      type="button"
                      onClick={() => setSessionImages(prev => prev.filter(item => item.id !== sImg.id))}
                      className="absolute top-1 right-1 text-[9px] text-red-500 hover:text-red-400 font-mono z-10 cursor-pointer"
                      title="Удалить"
                    >
                      ✖
                    </button>
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-black/50 border border-white/10 flex items-center justify-center">
                      <img src={sImg.image} className="h-full w-full object-cover" alt="Thumb" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-grow space-y-1">
                      <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Изображение #{sIdx + 1}</span>
                      <input
                        type="text"
                        value={sImg.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSessionImages(prev => prev.map(item => item.id === sImg.id ? { ...item, description: val } : item));
                        }}
                        placeholder="Описание (например: Продукт)..."
                        className="w-full bg-black/50 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none focus:border-sky-400/30 font-sans"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              id="fast-generate-btn"
              onClick={handleGenerateDeck}
              disabled={isLoading}
              className="flex-1 bg-[#F59E0B] hover:bg-amber-400 text-black font-extrabold uppercase text-[10px] py-3.5 px-4 rounded-sm cursor-pointer disabled:opacity-50 transition-colors tracking-widest"
            >
              Сгенерировать Pitch Deck →
            </button>
            <div className="flex items-center justify-center gap-2 opacity-40 px-2">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Auto-Save</span>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: THE PITCH CANVAS - LIVE BRAIN (5 COLS) */}
      <div className="lg:col-span-5 flex flex-col justify-between bg-[#0D0D0F] border border-white/10 rounded-lg p-5 shadow-xl h-[75vh]">
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-3 block">Pitch Deck Structure</h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            По мере вашего диалога ИИ анализирует смыслы стартапа и формирует готовые холсты секций.
          </p>
        </div>

        {/* Canvas elements with visual statuses */}
        <div className="flex-grow overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {(Object.entries(canvas) as [string, any][]).map(([key, item]) => {
            const isLocked = item.status === 'locked';
            const isThinking = item.status === 'thinking';
            const isCompiled = item.status === 'compiled';

            return (
              <div
                key={key}
                className={`relative group rounded-md border p-4 overflow-hidden transition-all duration-155 ${
                  isCompiled 
                    ? "bg-white/5 border-white/15 text-slate-100" 
                    : isThinking 
                    ? "bg-white/5 border-white/20 text-slate-400 animate-pulse" 
                    : "bg-white/5 border-white/5 text-slate-600 opacity-40 grayscale"
                }`}
              >
                {/* Left background indicator bar */}
                {isCompiled && (
                  <div className="absolute inset-y-0 left-0 bg-green-500/10 w-full z-0"></div>
                )}
                {isThinking && (
                  <div className="absolute inset-y-0 left-0 bg-white/5 w-1/3 z-0"></div>
                )}

                <div className="relative z-10 flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-300">
                    {item.title}
                  </span>

                  {isCompiled ? (
                    <span className="text-[9px] text-green-500 font-mono font-bold tracking-widest">
                      FIXED
                    </span>
                  ) : isThinking ? (
                    <span className="text-[9px] text-amber-500 font-mono font-bold tracking-widest animate-pulse">
                      DRAFT
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-600 font-mono">
                      LOCKED
                    </span>
                  )}
                </div>

                <div className="relative z-10">
                  {isCompiled ? (
                    <div className="space-y-1.5">
                      <p className="text-xs text-slate-300 leading-relaxed font-semibold italic">{item.summary}</p>
                      <ul className="text-[10px] text-slate-400 space-y-1 list-disc list-inside bg-black/40 p-2 rounded border border-white/5">
                        {item.bullets.map((bullet: string, bIdx: number) => (
                          <li key={bIdx} className="leading-relaxed">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-[11px] font-mono text-slate-655">
                      {isThinking 
                        ? "Сопоставление ваших ответов с методологией..." 
                        : "Ожидайте разбор этой темы в диалоге."}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </motion.div>
  );
};
