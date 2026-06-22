import decksyLogo from "../images/logo.png";

interface DeckWatermarkProps {
  forExport?: boolean;
  className?: string;
}

export function DeckWatermark({ forExport = false, className = "" }: DeckWatermarkProps) {
  const logoSize = forExport ? "h-7 w-7" : "h-4 w-4 sm:h-5 sm:w-5";
  const textSize = forExport ? "text-[13px]" : "text-[8px] sm:text-[9px]";
  const pad = forExport ? "px-3 py-1.5 gap-2" : "px-2 py-1 gap-1.5 sm:gap-2";

  return (
    <div
      className={`inline-flex items-center rounded-full border border-white/10 ${pad} ${className}`}
      style={{ background: "rgba(0, 0, 0, 0.42)" }}
    >
      <img src={decksyLogo} alt="" className={`${logoSize} rounded-sm object-contain shrink-0`} />
      <span className={`${textSize} font-mono tracking-wide text-white/75 lowercase leading-none`}>
        made <span className="text-white/95 font-semibold">decksy.ru</span>
      </span>
    </div>
  );
}
