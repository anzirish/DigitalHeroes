import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import ConfirmDialog from '../../components/ConfirmDialog';

const emptyForm = { name: '', description: '', image_url: '', website_url: '', is_featured: false };

export default function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchCharities = async () => {
    const { data } = await api.get('/charities');
    setCharities(data);
  };

  useEffect(() => { fetchCharities(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/admin/charities/${editing}`, form);
        toast.success('Charity updated');
      } else {
        await api.post('/admin/charities', form);
        toast.success('Charity created');
      }
      setForm(emptyForm);
      setEditing(null);
      setShowForm(false);
      fetchCharities();
    } catch {
      toast.error('Failed to save charity');
    }
  };

  const deleteCharity = async (id) => {
    await api.delete(`/admin/charities/${id}`);
    toast.success('Charity deactivated');
    setDeleteConfirm(null);
    fetchCharities();
  };

  const startEdit = (c) => {
    setForm({ name: c.name, description: c.description, image_url: c.image_url || '', website_url: c.website_url || '', is_featured: c.is_featured });
    setEditing(c.id);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Charities</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); }} className="btn-primary flex items-center gap-2 text-sm py-2">
          <Plus size={16} /> Add Charity
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-bold text-white mb-4">{editing ? 'Edit' : 'Add'} Charity</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Name</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Website URL</label>
                <input className="input" type="url" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input h-24 resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label">Image URL</label>
              <input className="input" type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="accent-brand-500" />
              <span className="text-gray-300 text-sm">Featured on homepage</span>
            </label>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {charities.map((c) => (
          <div key={c.id} className="card">
            {c.image_url && <img src={c.image_url} alt={c.name} className="w-full h-32 object-cover rounded-xl mb-3" />}
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-white text-sm">{c.name}</h3>
              {c.is_featured && <Star size={14} className="text-gold-400 fill-gold-400 flex-shrink-0" />}
            </div>
            <p className="text-gray-500 text-xs line-clamp-2 mb-3">{c.description}</p>
            <div className="flex gap-2">
              <button onClick={() => startEdit(c)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                <Edit2 size={12} /> Edit
              </button>
              <button onClick={() => setDeleteConfirm(c.id)} className="text-red-400 hover:text-red-300 text-xs py-1.5 px-3 rounded-lg border border-red-900/30 hover:bg-red-900/10 transition-colors flex items-center gap-1">
                <Trash2 size={12} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Deactivate this charity?"
        message="It will be hidden from users but not permanently deleted."
        confirmLabel="Deactivate"
        variant="danger"
        onConfirm={() => deleteCharity(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
