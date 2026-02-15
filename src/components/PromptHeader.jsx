export default function PromptHeader({ text, variant = 'blue' }) {
  const bgClass = variant === 'yellow' ? 'bg-sondr-yellow' : 'bg-sondr-blue'

  return (
    <div className={`${bgClass} w-100 py-3 px-3 d-flex justify-content-center`}>
      <div className="prompt-pill rounded-pill fw-semibold text-center py-2 px-4 w-100">
        {text ? `"${text}"` : 'Loading prompt...'}
      </div>
    </div>
  )
}
