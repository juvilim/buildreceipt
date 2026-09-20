import { useState } from 'react'

type StatusToastProps = {
  message: string
  title: string
  tone?: 'info' | 'error'
}

export function StatusToast({ message, title, tone = 'info' }: StatusToastProps) {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <aside
      className={`status-toast status-toast--${tone}`}
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
    >
      <span className="status-toast__mark" aria-hidden="true">{tone === 'error' ? '!' : '→'}</span>
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
      <button
        className="status-toast__close"
        type="button"
        onClick={() => setVisible(false)}
        aria-label={`Dismiss ${title.toLowerCase()} notification`}
      >
        ×
      </button>
    </aside>
  )
}
