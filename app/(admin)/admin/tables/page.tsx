'use client'
import { useState, useEffect } from 'react'
import { Plus, Download, QrCode, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'
import Image from 'next/image'

export default function TablesPage() {
  const { toast } = useToast()
  const [tables, setTables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newTableNum, setNewTableNum] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetch('/api/admin/tables')
      .then(r => r.json())
      .then(d => { setTables(d); setLoading(false) })
  }, [])

  async function addTable() {
    const num = parseInt(newTableNum)
    if (!num) { toast('Enter a valid table number', 'error'); return }
    setAdding(true)
    const res = await fetch('/api/admin/tables', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number: num }) })
    const d = await res.json()
    if (res.ok) { setTables(prev => [...prev, d]); setNewTableNum(''); toast(`Table ${num} added!`) }
    else toast(d.error || 'Failed', 'error')
    setAdding(false)
  }

  async function deleteTable(id: string, num: number) {
    if (!confirm(`Delete Table ${num}?`)) return
    await fetch(`/api/admin/tables/${id}`, { method: 'DELETE' })
    setTables(prev => prev.filter(t => t.id !== id))
    toast('Table deleted')
  }

  function downloadQR(table: any) {
    const link = document.createElement('a')
    link.href = table.qrCode
    link.download = `table-${table.number}-qr.png`
    link.click()
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tables & QR Codes</h1>
        <div className="flex items-center gap-3">
          <Input value={newTableNum} onChange={e => setNewTableNum(e.target.value)} placeholder="Table number" type="number" className="w-32" />
          <Button onClick={addTable} disabled={adding}><Plus className="h-4 w-4 mr-1" /> Add Table</Button>
        </div>
      </div>
      <p className="text-sm text-gray-500">Each QR code links to <code className="bg-gray-100 px-1 rounded">app.com/?table=N</code>. Print and place on the physical table.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {tables.map(table => (
          <div key={table.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-3">
            <p className="font-bold text-gray-900 text-lg">Table {table.number}</p>
            {table.qrCode && (
              <div className="relative h-32 w-32">
                <Image src={table.qrCode} alt={`QR Table ${table.number}`} fill className="object-contain" />
              </div>
            )}
            <div className="flex gap-2 w-full">
              {table.qrCode && (
                <button onClick={() => downloadQR(table)} className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-gray-600">
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              )}
              <button onClick={() => deleteTable(table.id, table.number)} className="p-1.5 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 transition text-red-400">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
