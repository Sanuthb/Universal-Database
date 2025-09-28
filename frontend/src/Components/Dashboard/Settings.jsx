import React, { useEffect, useState } from 'react'
import { Copy } from 'lucide-react'
import axios from 'axios'

const Settings = () => {
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchApiKey = async () => {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('token')
      const res = await axios.get('http://localhost:9000/api/v1/user/api-key', {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      })
      if (res.data?.apiKey) setApiKey(res.data.apiKey)
    } catch (e) {
      setError(e?.response?.data?.message || e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchApiKey() }, [])

  const copy = async () => {
    try { await navigator.clipboard.writeText(apiKey) } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">API Key</h2>
        <p className="text-gray-600 mb-3">Use this key in public URLs: <code>http://localhost:9000/&lt;apikey&gt;/&lt;project&gt;/&lt;table&gt;</code></p>
        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
        <div className="flex items-center gap-2">
          <input readOnly value={apiKey} className="w-full border rounded p-2" placeholder={loading ? 'Loading...' : 'Generate on first use'} />
          <button onClick={copy} className="px-3 py-2 border rounded flex items-center gap-1"><Copy size={14}/>Copy</button>
        </div>
      </div>
    </div>
  )
}

export default Settings