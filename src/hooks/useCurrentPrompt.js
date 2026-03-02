import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Start date for prompt cycling (prompt sort_order 0)
const BASE_DATE = new Date('2026-02-09T00:00:00')
const MS_PER_CYCLE = 3 * 24 * 60 * 60 * 1000

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
        const cyclesSinceBase = Math.floor((now - BASE_DATE) / MS_PER_CYCLE)
        const index = ((cyclesSinceBase % data.length) + data.length) % data.length
        setPrompt(data[index])
      }
      setLoading(false)
    }
    fetchPrompt()
  }, [])

  return { prompt, loading }
}
