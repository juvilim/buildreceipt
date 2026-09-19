import type { FormEvent } from 'react'
import type { ReceiptDraft } from '../types'

type ReceiptComposerProps = {
  draft: ReceiptDraft
  onChange: (draft: ReceiptDraft) => void
  onPrepare: () => void
}

const fields: Array<{
  key: keyof ReceiptDraft
  label: string
  placeholder: string
  maxLength: number
  type?: 'url'
}> = [
  { key: 'project', label: 'Project', placeholder: 'BuildReceipt', maxLength: 128 },
  { key: 'version', label: 'Version', placeholder: '1.0.0', maxLength: 128 },
  { key: 'releaseUrl', label: 'Release URL', placeholder: 'https://example.com/releases/1.0.0', maxLength: 2048, type: 'url' },
  { key: 'commitHash', label: 'Commit hash', placeholder: '02c4a7d', maxLength: 128 },
  { key: 'note', label: 'Release note', placeholder: 'What changed in this release?', maxLength: 2048 },
]

export function ReceiptComposer({ draft, onChange, onPrepare }: ReceiptComposerProps) {
  function submitDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onPrepare()
  }

  return (
    <form className="panel composer" onSubmit={submitDraft}>
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">01 / Compose</p>
          <h3>Release details</h3>
        </div>
        <span className="draft-label">Local draft</span>
      </div>
      <div className="form-grid">
        {fields.map((field) => {
          const fieldId = `receipt-${field.key}`
          const isNote = field.key === 'note'
          return (
            <label className={`field ${isNote ? 'field--full' : ''}`} htmlFor={fieldId} key={field.key}>
              <span className="field-label">
                {field.label}
                <span className="field-count tabular">{draft[field.key].length}/{field.maxLength}</span>
              </span>
              {isNote ? (
                <textarea
                  id={fieldId}
                  maxLength={field.maxLength}
                  onChange={(event) => onChange({ ...draft, [field.key]: event.target.value })}
                  placeholder={field.placeholder}
                  rows={4}
                  value={draft[field.key]}
                />
              ) : (
                <input
                  id={fieldId}
                  maxLength={field.maxLength}
                  onChange={(event) => onChange({ ...draft, [field.key]: event.target.value })}
                  placeholder={field.placeholder}
                  type={field.type ?? 'text'}
                  value={draft[field.key]}
                />
              )}
            </label>
          )
        })}
      </div>
      <div className="form-footer">
        <p>Nothing leaves this browser during preview mode.</p>
        <button className="button button--primary" type="submit">Prepare receipt</button>
      </div>
    </form>
  )
}
