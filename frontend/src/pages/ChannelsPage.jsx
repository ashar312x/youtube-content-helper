import { useState, useEffect } from 'react';
import { Tv, Plus, Edit2, Trash2, Check, X, ChevronRight, Loader2 } from 'lucide-react';
import { channelsAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function ChannelCard({ channel, onDelete, onUpdate, onSelect }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: channel.name, niche: channel.niche || '', description: channel.description || '' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await onUpdate(channel.id, form);
      setEditing(false);
      toast.success('Channel updated');
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-4">
      {editing ? (
        <div className="space-y-3">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Channel name"
            className="input text-sm"
          />
          <input
            value={form.niche}
            onChange={(e) => setForm({ ...form, niche: e.target.value })}
            placeholder="Niche (e.g. Tech, Cooking, Finance...)"
            className="input text-sm"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Channel description..."
            rows={2}
            className="input text-sm resize-none"
          />
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="btn-primary text-xs flex items-center gap-1.5 py-1.5">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
            </button>
            <button onClick={() => setEditing(false)} className="btn-secondary text-xs flex items-center gap-1.5 py-1.5">
              <X className="w-3 h-3" /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <button
            onClick={() => onSelect(channel.name)}
            className="flex-1 text-left hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center shrink-0">
                <Tv className="w-4 h-4 text-red-400" />
              </div>
              <span className="font-semibold">{channel.name}</span>
              {channel.niche && (
                <span className="badge bg-yt-border text-gray-400 text-xs">{channel.niche}</span>
              )}
            </div>
            {channel.description && (
              <p className="text-xs text-gray-400 ml-10 line-clamp-2">{channel.description}</p>
            )}
            <p className="text-xs text-gray-600 ml-10 mt-1">
              Updated {new Date(channel.updatedAt).toLocaleDateString()}
            </p>
          </button>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setEditing(true)} className="text-gray-500 hover:text-white transition-colors p-1.5 rounded">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(channel.id)} className="text-gray-500 hover:text-red-400 transition-colors p-1.5 rounded">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onSelect(channel.name)} className="text-gray-500 hover:text-white transition-colors p-1.5 rounded">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', niche: '', description: '' });
  const [creating, setCreating] = useState(false);
  const { setChannel } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    setLoading(true);
    try {
      const res = await channelsAPI.list();
      setChannels(res.data || []);
    } catch {
      toast.error('Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  const createChannel = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const res = await channelsAPI.create(form.name, form.niche, form.description);
      setChannels((prev) => [res.data, ...prev.filter((c) => c.id !== res.data.id)]);
      setForm({ name: '', niche: '', description: '' });
      setShowForm(false);
      toast.success('Channel created!');
    } catch {
      toast.error('Failed to create');
    } finally {
      setCreating(false);
    }
  };

  const updateChannel = async (id, data) => {
    const res = await channelsAPI.update(id, data);
    setChannels((prev) => prev.map((c) => (c.id === id ? res.data : c)));
  };

  const deleteChannel = async (id) => {
    try {
      await channelsAPI.delete(id);
      setChannels((prev) => prev.filter((c) => c.id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const selectChannel = (name) => {
    setChannel(name);
    navigate('/');
    toast.success(`Switched to "${name}"`);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Channels</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage your YouTube channels and their niches</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Channel
        </button>
      </div>

      {/* New channel form */}
      {showForm && (
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Add New Channel</h3>
          <form onSubmit={createChannel} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Channel Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="TechWithMike"
                  className="input text-sm"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Niche</label>
                <input
                  type="text"
                  value={form.niche}
                  onChange={(e) => setForm({ ...form, niche: e.target.value })}
                  placeholder="Tech, Finance, Cooking..."
                  className="input text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What is this channel about?"
                rows={2}
                className="input text-sm resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={creating || !form.name.trim()} className="btn-primary text-sm flex items-center gap-1.5">
                {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Create Channel
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Channels list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-yt-border border-t-red-500 rounded-full animate-spin" />
        </div>
      ) : channels.length === 0 ? (
        <div className="card p-12 text-center">
          <Tv className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No channels yet</p>
          <p className="text-gray-600 text-sm mt-1">Create your first channel to organize your content</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mt-4 flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" /> Add Channel
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {channels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              onDelete={deleteChannel}
              onUpdate={updateChannel}
              onSelect={selectChannel}
            />
          ))}
        </div>
      )}

      <div className="card p-4 bg-blue-950/20 border-blue-900/30">
        <p className="text-xs text-blue-300">
          <strong>Tip:</strong> Click any channel card to set it as the active channel for the Generator, Ideas, and History pages. Your 8 most recently used channels are also saved for quick access in the Generator.
        </p>
      </div>
    </div>
  );
}
