'use client'
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, GripVertical, ToggleLeft, ToggleRight, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Spinner } from '@/components/ui/spinner'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import Image from 'next/image'

export default function MenuPage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showItemModal, setShowItemModal] = useState(false)
  const [showCatModal, setShowCatModal] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [editCat, setEditCat] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({ name: '', description: '', price: '', categoryId: '', image: '', isAvailable: true, isPopular: false })
  const [catForm, setCatForm] = useState({ name: '', description: '' })

  useEffect(() => {
    fetch('/api/dashboard/menu')
      .then(r => r.json())
      .then(d => { setCategories(d.categories); setLoading(false) })
  }, [])

  async function saveItem() {
    setSaving(true)
    const url = editItem ? `/api/dashboard/menu/items/${editItem.id}` : '/api/dashboard/menu/items'
    const method = editItem ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, price: parseFloat(form.price) }) })
    const data = await res.json()
    toast(editItem ? 'Item updated' : 'Item added')
    // Refresh
    fetch('/api/dashboard/menu').then(r => r.json()).then(d => setCategories(d.categories))
    setShowItemModal(false)
    setForm({ name: '', description: '', price: '', categoryId: '', image: '', isAvailable: true, isPopular: false })
    setSaving(false)
  }

  async function saveCategory() {
    setSaving(true)
    const url = editCat ? `/api/dashboard/menu/categories/${editCat.id}` : '/api/dashboard/menu/categories'
    const method = editCat ? 'PATCH' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(catForm) })
    toast(editCat ? 'Category updated' : 'Category added')
    fetch('/api/dashboard/menu').then(r => r.json()).then(d => setCategories(d.categories))
    setShowCatModal(false)
    setCatForm({ name: '', description: '' })
    setSaving(false)
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this item?')) return
    await fetch(`/api/dashboard/menu/items/${id}`, { method: 'DELETE' })
    toast('Item deleted')
    fetch('/api/dashboard/menu').then(r => r.json()).then(d => setCategories(d.categories))
  }

  async function toggleAvailable(id: string, current: boolean) {
    await fetch(`/api/dashboard/menu/items/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isAvailable: !current }) })
    fetch('/api/dashboard/menu').then(r => r.json()).then(d => setCategories(d.categories))
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setEditCat(null); setCatForm({ name: '', description: '' }); setShowCatModal(true) }}>
            <Plus className="h-4 w-4 mr-1" /> Category
          </Button>
          <Button size="sm" onClick={() => { setEditItem(null); setForm({ name: '', description: '', price: '', categoryId: '', image: '', isAvailable: true, isPopular: false }); setShowItemModal(true) }}>
            <Plus className="h-4 w-4 mr-1" /> Item
          </Button>
        </div>
      </div>

      {categories.map(cat => (
        <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h3 className="font-semibold text-gray-900">{cat.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{cat.items.length} items</span>
              <button onClick={() => { setEditCat(cat); setCatForm({ name: cat.name, description: cat.description || '' }); setShowCatModal(true) }} className="p-1.5 hover:bg-gray-200 rounded-lg transition">
                <Pencil className="h-3.5 w-3.5 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {cat.items.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                {item.image ? (
                  <div className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                ) : <div className="h-14 w-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><ImageIcon className="h-5 w-5 text-gray-300" /></div>}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-gray-900">{item.name}</p>
                    {item.isPopular && <Badge variant="warning" className="text-[10px]">Popular</Badge>}
                    {!item.isAvailable && <Badge variant="secondary" className="text-[10px]">Unavailable</Badge>}
                  </div>
                  {item.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>}
                </div>
                <span className="font-semibold text-gray-900">{formatCurrency(item.price)}</span>
                <Switch checked={item.isAvailable} onCheckedChange={() => toggleAvailable(item.id, item.isAvailable)} />
                <button onClick={() => { setEditItem(item); setForm({ name: item.name, description: item.description || '', price: String(item.price), categoryId: item.categoryId || '', image: item.image || '', isAvailable: item.isAvailable, isPopular: item.isPopular }); setShowItemModal(true) }} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                  <Pencil className="h-4 w-4 text-gray-400" />
                </button>
                <button onClick={() => deleteItem(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition">
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </div>
            ))}
            {cat.items.length === 0 && <div className="px-6 py-4 text-sm text-gray-400 italic">No items in this category</div>}
          </div>
        </div>
      ))}

      {/* Item Modal */}
      <Modal open={showItemModal} onClose={() => setShowItemModal(false)} title={editItem ? 'Edit Item' : 'Add Menu Item'}>
        <div className="p-6 space-y-4">
          <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Taco al pastor" className="mt-1" /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Delicious..." className="mt-1" /></div>
          <div><Label>Price</Label><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0.00" step="0.01" min="0" className="mt-1" /></div>
          <div>
            <Label>Category</Label>
            <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} className="mt-1 flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="">No category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><Label>Image URL</Label><Input value={form.image} onChange={e => setForm({...form, image: e.target.value})} placeholder="https://..." className="mt-1" /></div>
          <div className="flex items-center justify-between"><Label>Available</Label><Switch checked={form.isAvailable} onCheckedChange={v => setForm({...form, isAvailable: v})} /></div>
          <div className="flex items-center justify-between"><Label>Mark as Popular</Label><Switch checked={form.isPopular} onCheckedChange={v => setForm({...form, isPopular: v})} /></div>
          <Button onClick={saveItem} className="w-full" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}{editItem ? 'Update Item' : 'Add Item'}</Button>
        </div>
      </Modal>

      {/* Category Modal */}
      <Modal open={showCatModal} onClose={() => setShowCatModal(false)} title={editCat ? 'Edit Category' : 'Add Category'}>
        <div className="p-6 space-y-4">
          <div><Label>Category Name</Label><Input value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} placeholder="Tacos, Burgers, Drinks..." className="mt-1" /></div>
          <div><Label>Description</Label><Input value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} placeholder="Optional" className="mt-1" /></div>
          <Button onClick={saveCategory} className="w-full" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}{editCat ? 'Update' : 'Add Category'}</Button>
        </div>
      </Modal>
    </div>
  )
}
