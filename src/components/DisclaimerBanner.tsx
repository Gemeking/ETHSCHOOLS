export default function DisclaimerBanner() {
  const items = [
    { icon: '⚠️', text: 'Not everything is 100% accurate — only ', highlight: '✓ Verified', rest: ' listings are confirmed. Always confirm with the school.' },
    { icon: '📩', text: 'Contact us on Telegram:', link: 'https://t.me/abrolabs', linkText: '@abrolabs' },
    { icon: '📞', text: 'Call / WhatsApp:', link: 'tel:+251937595664', linkText: '0937 595 664' },
    { icon: '🏫', text: 'Register your school:', link: 'https://t.me/abrolabs', linkText: 'Message us' },
    { icon: '⚠️', text: 'Report wrong info:', link: 'https://t.me/abrolabs', linkText: 'Tell us on Telegram' },
    { icon: '💻', text: 'Need a website? We build it!', link: 'https://t.me/abrolabs', linkText: 'Talk to us' },
  ]

  const renderItem = (item: typeof items[0], key: string) => (
    <span key={key} className="inline-flex items-center gap-1.5 mx-6 whitespace-nowrap">
      <span>{item.icon}</span>
      <span className="text-amber-100">{item.text}</span>
      {item.highlight && (
        <span className="text-white font-bold">{item.highlight}</span>
      )}
      {item.rest && (
        <span className="text-amber-100">{item.rest}</span>
      )}
      {item.link && (
        <a
          href={item.link}
          target={item.link.startsWith('tel') ? '_self' : '_blank'}
          rel="noopener noreferrer"
          className="text-white font-bold underline underline-offset-2 hover:text-amber-200 transition-colors"
        >
          {item.linkText}
        </a>
      )}
      <span className="mx-2 text-amber-400 font-bold">·</span>
    </span>
  )

  return (
    <div className="sticky top-0 z-[60] bg-amber-500 border-b border-amber-600 overflow-hidden h-9 flex items-center shadow-sm">
      {/* Ticker track — duplicated for seamless loop */}
      <div className="animate-ticker flex shrink-0">
        {items.map((item, i) => renderItem(item, `a-${i}`))}
        {items.map((item, i) => renderItem(item, `b-${i}`))}
      </div>
    </div>
  )
}
