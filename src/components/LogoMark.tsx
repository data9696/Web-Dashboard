export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 4C11 4 4 11 4 20c0 9 7 16 16 16 4 0 7.5-1.5 10-4-3 .5-6.5-.5-9-3-3.5-3.5-4-8.5-1.5-12.5C21.5 13.5 25 11.5 28.5 12c2 .3 3.7 1.3 5 2.7C32 8.7 26.5 4 20 4Z"
        fill="var(--color-sage)"
      />
      <path
        d="M14 22c1.5 3 4 5 7 5.5"
        stroke="var(--color-cream)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
