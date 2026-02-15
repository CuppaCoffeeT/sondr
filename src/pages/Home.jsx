import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useCurrentPrompt } from '../hooks/useCurrentPrompt'
import PromptHeader from '../components/PromptHeader'
import PostCard from '../components/PostCard'
import BottomNav from '../components/BottomNav'

export default function Home() {
  const { prompt, loading: promptLoading } = useCurrentPrompt()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!prompt) return
    async function fetchPosts() {
      const { data } = await supabase
        .from('posts')
        .select('*, profiles(username, avatar_url)')
        .eq('prompt_id', prompt.id)
        .order('created_at', { ascending: false })
      setPosts(data || [])
      setLoading(false)
    }
    fetchPosts()
  }, [prompt])

  return (
    <div className="has-bottom-nav">
      <PromptHeader text={prompt?.text} variant="blue" />

      <div className="container-fluid p-3">
        {(loading || promptLoading) ? (
          <p className="text-center text-secondary py-5">Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-secondary py-5">No posts yet. Be the first to share!</p>
        ) : (
          <div className="row g-3">
            {posts.map(post => (
              <div key={post.id} className="col-6">
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
