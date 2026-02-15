export default function Avatar({ url, size = 32 }) {
  return (
    <div className="rounded-circle overflow-hidden flex-shrink-0"
         style={{ width: size, height: size }}>
      {url ? (
        <img src={url} alt="" className="w-100 h-100"
             style={{ objectFit: 'cover' }} />
      ) : (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="15" stroke="#ccc" strokeWidth="1.5" />
          <circle cx="16" cy="12" r="5" stroke="#ccc" strokeWidth="1.5" />
          <path d="M6 27c0-5.5 4.5-10 10-10s10 4.5 10 10"
                stroke="#ccc" strokeWidth="1.5" fill="none" />
        </svg>
      )}
    </div>
  )
}
