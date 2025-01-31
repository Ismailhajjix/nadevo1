import { supabase } from '@/lib/supabase'

export default async function TestPage() {
  const { data, error } = await supabase.from('votes').select('count').limit(1)
  
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
