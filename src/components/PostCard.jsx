import { useNavigate } from 'react-router-dom'

export default function PostCard({ post, from }) {
  const navigate = useNavigate()
  const label = post.caption || (post.story ? post.story.slice(0, 30) + (post.story.length > 30 ? '...' : '') : null)

  return (
    <div className="post-card" onClick={() => navigate(`/post/${post.id}`, { state: { from } })}>
      <div style={{ aspectRatio: '1', overflow: 'hidden' }}>
        <img
          src={post.photo_url}
          alt={post.story || 'Post photo'}
          className="w-100 h-100 aspect-square"
          loading="lazy"
        />
      </div>
      <p className="post-card__caption small fw-medium text-coral px-2 py-2 mb-0 bg-sondr-pink">
        {label ? `"${label}"` : '\u00A0'}
      </p>
    </div>
  )
}
