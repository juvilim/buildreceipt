import type { FormEvent } from 'react'
import { FIELD_LIMITS } from '../config/contract'
import type { ReceiptDraft } from '../types'

type ReceiptComposerProps = {
  draft: ReceiptDraft
  disabled: boolean
  submitDisabled?: boolean
  submitLabel: string
  onChange: (draft: ReceiptDraft) => void
  onPrepare: () => void | Promise<void>
}

const fields: Array<{
  key: keyof ReceiptDraft
  label: string
  placeholder: string
  maxLength: number
  type?: 'url'
}> = [
  { key: 'project', label: 'Project', placeholder: 'BuildReceipt', maxLength: FIELD_LIMITS.project },
  { key: 'version', label: 'Version', placeholder: '1.0.0', maxLength: FIELD_LIMITS.version },
  { key: 'releaseUrl', label: 'Release URL', placeholder: 'https://example.com/releases/1.0.0', maxLength: FIELD_LIMITS.releaseUrl, type: 'url' },
  { key: 'commitHash', label: 'Commit hash', placeholder: '02c4a7d', maxLength: FIELD_LIMITS.commitHash },
  { key: 'note', label: 'Release note', placeholder: 'What changed in this release?', maxLength: FIELD_LIMITS.note },
]

export function ReceiptComposer({ draft, disabled, submitDisabled = disabled, submitLabel, onChange, onPrepare }: ReceiptComposerProps) {
  function submitDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void onPrepare()
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
                  disabled={disabled}
                  maxLength={field.maxLength}
                  onChange={(event) => onChange({ ...draft, [field.key]: event.target.value })}
                  placeholder={field.placeholder}
                  rows={4}
                  value={draft[field.key]}
                />
              ) : (
                <input
                  id={fieldId}
                  disabled={disabled}
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
        <p>One wallet transaction creates a permanent, append-only record.</p>
        <button className="button button--primary" disabled={submitDisabled} type="submit">{submitLabel}</button>
      </div>
    </form>
  )
}
