'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestPage() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: result, error: queryError } = await supabase
          .from('votes')
          .select('count')
          .limit(1)
        
        if (queryError) throw queryError
        setData(result)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      {error ? (
        <div className="text-red-500">
          <p>Connection Error:</p>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      ) : (
        <div className="text-green-500">
          <p>✅ Supabase connection successful!</p>
          <p>Data received: {JSON.stringify(data)}</p>
        </div>
      )}
    </div>
  )
}
