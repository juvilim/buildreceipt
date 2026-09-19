type LogoMarkProps = {
  small?: boolean
}

export function LogoMark({ small = false }: LogoMarkProps) {
  return (
    <svg
      className={`brand-mark${small ? ' brand-mark--small' : ''}`}
      viewBox="0 0 36 40"
      aria-hidden="true"
    >
      <path
        className="brand-mark__paper"
        d="M5 2.5h22a3 3 0 0 1 3 3v29l-4-2.8-4 2.8-4-2.8-4 2.8-4-2.8-5 3V5.5a3 3 0 0 1 3-3Z"
      />
      <path className="brand-mark__line" d="M10 9h12M10 14h8" />
      <path className="brand-mark__check" d="m10 23 4 4 9-10" />
      <path className="brand-mark__link" d="M27 13.5h2.5a4 4 0 1 1 0 8H27m-4-8h-2.5a4 4 0 1 0 0 8H23" />
    </svg>
  )
}
