import React, { useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { motion } from "motion/react";

interface IntroPageProps {
  idea: string;
  setIdea: (value: string) => void;
  suggestions: string[];
  isLoading: boolean;
  handleStartInterview: () => void;
  userName?: string | null;
  activeAds: any[];
}

export const IntroPage: React.FC<IntroPageProps> = ({
  idea,
  setIdea,
  suggestions,
  isLoading,
  handleStartInterview,
  userName,
  activeAds,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const displayName = userName?.trim() || null;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [idea]);

  const handleSubmit = () => {
    if (!idea.trim() || isLoading) return;
    handleStartInterview();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      id="screen-intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full flex flex-col min-h-[calc(100dvh-10rem)] max-w-3xl mx-auto px-4 sm:px-6"
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center py-8 sm:py-12">
        <h1 className="text-2xl sm:text-[2rem] font-normal text-white tracking-tight leading-snug">
          {displayName ? (
            <>
              Здравствуйте, {displayName}.
              <br />
              Что создаём сегодня?
            </>
          ) : (
            <>
              Здравствуйте.
              <br />
              Что создаём сегодня?
            </>
          )}
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-400 font-normal">
          Опишите идею для презентации или запрос на Word-документ — агент поможет собрать результат.
        </p>
      </div>

      <div className="w-full pb-6 sm:pb-8 space-y-3 shrink-0">
        <div className="relative flex items-end rounded-[1.75rem] border border-white/10 bg-[#2a2a2c] shadow-lg shadow-black/20 focus-within:border-white/20 transition-colors">
          <textarea
            ref={textareaRef}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Презентация или «Сделай проект docx про робототехнику»..."
            rows={1}
            disabled={isLoading}
            className="w-full min-h-[52px] max-h-[200px] bg-transparent border-none rounded-[1.75rem] px-5 py-4 pr-14 text-[15px] text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none leading-relaxed"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !idea.trim()}
            className="absolute right-2.5 bottom-2.5 h-9 w-9 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-25 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors cursor-pointer border-none"
            aria-label="Начать"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.slice(0, 3).map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setIdea(sug)}
                className="text-[13px] text-slate-400 hover:text-slate-200 bg-transparent hover:bg-white/[0.06] border border-white/8 rounded-full px-3.5 py-1.5 transition-colors cursor-pointer truncate max-w-full"
              >
                {sug.length > 48 ? `${sug.slice(0, 48)}…` : sug}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeAds && activeAds.length > 0 && (
        <div className="pb-8 space-y-3 opacity-70 hover:opacity-100 transition-opacity">
          {activeAds.slice(0, 2).map((ad: any) => (
            <a
              key={ad.id}
              href={ad.link || "#"}
              target={ad.link ? "_blank" : undefined}
              rel={ad.link ? "noreferrer" : undefined}
              onClick={(e) => {
                if (!ad.link) e.preventDefault();
              }}
              className="block rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-center no-underline hover:bg-white/[0.05] transition-colors"
            >
              {ad.imageUrl && (
                <img
                  src={ad.imageUrl}
                  alt=""
                  className="mx-auto mb-2 max-h-10 object-contain"
                />
              )}
              <span className="block text-[11px] font-semibold text-slate-300">{ad.title}</span>
              {ad.content && (
                <span className="block text-[10px] text-slate-500 mt-1 leading-snug">{ad.content}</span>
              )}
            </a>
          ))}
        </div>
      )}
    </motion.div>
  );
};
