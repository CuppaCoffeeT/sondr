import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Monday of the first week (prompt sort_order 0)
const BASE_MONDAY = new Date('2026-02-09T00:00:00')
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000

export function useCurrentPrompt() {
  const [prompt, setPrompt] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPrompt() {
      const { data } = await supabase
        .from('prompts')
        .select('*')
        .not('sort_order', 'is', null)
        .order('sort_order', { ascending: true })

      if (data && data.length > 0) {
        const now = new Date()
        const weeksSinceBase = Math.floor((now - BASE_MONDAY) / MS_PER_WEEK)
        const index = ((weeksSinceBase % data.length) + data.length) % data.length
        setPrompt(data[index])
      }
      setLoading(false)
    }
    fetchPrompt()
  }, [])

  return { prompt, loading }
}
