export default function DisclaimerBanner() {
  const items = [
    '⚠️ Not everything is 100% accurate — only ✓ Verified listings are confirmed',
    '🏫 Register your school on Telegram',
    '⚠️ Report wrong info on Telegram',
    '💻 Need a website? We build it — contact us!',
    '📩 Always confirm details directly with the school',
  ]

  return (
    <div className="sticky top-0 z-[60] bg-amber-500 border-b border-amber-600 h-9 flex items-center overflow-hidden shadow-sm">

      {/* Scrolling ticker — left side */}
      <div className="flex-1 overflow-hidden flex items-center min-w-0">
        <div className="animate-ticker flex shrink-0 items-center text-xs font-semibold">
          {[...items, ...items].map((text, i) => (
            <span key={i} className="inline-flex items-center whitespace-nowrap">
              <span className="text-white/90 mx-5">{text}</span>
              <span className="text-amber-300 font-bold">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Fixed contact strip — always visible on the right */}
      <div className="shrink-0 flex items-center gap-0 border-l border-amber-400 bg-amber-600 h-full">
        <a
          href="https://t.me/abrolabs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 h-full text-white font-bold text-xs hover:bg-amber-700 transition-colors whitespace-nowrap"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          @abrolabs
        </a>
      </div>
    </div>
  )
}
