import { Button } from 'antd'

export default function EditModalFooter({ onCancel, onSubmit, submitLabel = 'Edit' }) {
  return (
    <div className="flex justify-start gap-2">
      <Button onClick={onCancel}>Cancel</Button>
      <Button type="primary" onClick={onSubmit}>
        {submitLabel}
      </Button>
    </div>
  )
}
