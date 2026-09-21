import { useEffect, useRef } from 'react'
import type { ReceiptRecord } from '../types'
import { ReceiptPreview } from './ReceiptPreview'

type ReceiptDialogProps = {
  receipt: ReceiptRecord
  copied: boolean
  onClose: () => void
  onCopyProofLink: (receipt: ReceiptRecord) => void | Promise<void>
}

const emptyDraft = {
  project: '',
  version: '',
  releaseUrl: '',
  commitHash: '',
  note: '',
}

export function ReceiptDialog({ receipt, copied, onClose, onCopyProofLink }: ReceiptDialogProps) {
  const dialogRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>('button, a[href], input, textarea, [tabindex]:not([tabindex="-1"])')]
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
      returnFocus?.focus()
    }
  }, [onClose])

  return (
    <div className="receipt-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="receipt-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="receipt-dialog__header">
          <div>
            <p className="eyebrow">Verified on-chain receipt</p>
            <h2 id="receipt-dialog-title">Receipt #{receipt.id.toString().padStart(6, '0')}</h2>
          </div>
          <button className="receipt-dialog__close" type="button" onClick={onClose} autoFocus aria-label="Close receipt">
            ×
          </button>
        </div>
        <ReceiptPreview
          draft={emptyDraft}
          account={null}
          contentHash={null}
          receipt={receipt}
          copied={copied}
          onCopyProofLink={onCopyProofLink}
        />
      </section>
    </div>
  )
}
