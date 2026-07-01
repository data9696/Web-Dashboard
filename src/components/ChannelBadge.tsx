interface ChannelStyle {
  label: string
  initial: string
  bg: string
  fg: string
}

const CHANNEL_STYLES: { match: string; style: ChannelStyle }[] = [
  { match: 'amazon', style: { label: 'Amazon', initial: 'a', bg: '#FFE8C2', fg: '#8a5a1f' } },
  { match: 'myntra', style: { label: 'Myntra', initial: 'M', bg: '#FFE0EC', fg: '#b3265f' } },
  { match: 'flipkart', style: { label: 'Flipkart', initial: 'F', bg: '#DCE9FF', fg: '#2454a8' } },
  { match: 'nykaa', style: { label: 'Nykaa', initial: 'N', bg: '#FFE0E0', fg: '#a8273e' } },
  { match: 'firstcry', style: { label: 'FirstCry', initial: 'FC', bg: '#FFE9D6', fg: '#b3601a' } },
  { match: 'shopify', style: { label: 'Shopify', initial: 'S', bg: 'var(--color-sage-light)', fg: 'var(--color-sage-dark)' } },
  { match: 'b2b', style: { label: 'B2B', initial: 'B2B', bg: 'var(--color-smokeblue-light)', fg: '#3c5a6e' } },
  { match: 'offline', style: { label: 'Offline', initial: 'OF', bg: 'var(--color-corn-light)', fg: '#8a6a1f' } },
]

const DEFAULT_STYLE: ChannelStyle = {
  label: 'Other',
  initial: '•',
  bg: 'var(--color-border)',
  fg: 'var(--color-muted)',
}

export function resolveChannelStyle(rawChannel: string): ChannelStyle {
  const lower = rawChannel.toLowerCase()
  const found = CHANNEL_STYLES.find((c) => lower.includes(c.match))
  return found ? found.style : { ...DEFAULT_STYLE, label: rawChannel }
}

export function ChannelBadge({ channel, size = 22 }: { channel: string; size?: number }) {
  const style = resolveChannelStyle(channel)
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-medium shrink-0"
      style={{
        width: size,
        height: size,
        background: style.bg,
        color: style.fg,
        fontSize: size * 0.4,
      }}
      title={style.label}
    >
      {style.initial}
    </span>
  )
}