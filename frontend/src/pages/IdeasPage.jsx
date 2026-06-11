import { useState, useEffect } from 'react';
import { Lightbulb, RefreshCw, Trash2, CheckCircle, Youtube } from 'lucide-react';
import { ideasAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['idea', 'scripting', 'filming', 'editing', 'published'];
const STATUS_COLORS = {
  idea: 'bg-gray-700 text-gray-300',
  scripting: 'bg-blue-900/50 text-blue-300',
  filming: 'bg-yellow-900/50 text-yellow-300',
  editing: 'bg-purple-900/50 text-purple-300',
  published: 'bg-green-900/50 text-green-300',
};

const DIFFICULTY_COLORS = {
  easy: 'bg-green-900/50 text-green-300',
  medium: 'bg-yellow-900/50 text-yellow-300',
  hard: 'bg-red-900/50 text-red-300',
};

export default function IdeasPage() {
  const { selectedChannel } = useApp();
  const [channelName, setChannelName] = useState(selectedChannel || '');
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchIdeas = async () => {
    if (!channelName.trim()) return;
    setLoading(true);
    try {
      const res = await ideasAPI.list(channelName, filterStatus);
      setIdeas(res.data || []);
    } catch (err) {
      toast.error('Failed to load ideas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (channelName) fetchIdeas();
  }, [filterStatus]);

  const generateIdeas = async () => {
    if (!channelName.trim()) { toast.error('Enter a channel name'); return; }
    setGenerating(true);
    try {
      const res = await ideasAPI.generate(channelName, 10);
      toast.success(`${res.data.length} ideas generated!`);
      fetchIdeas();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate ideas');
    } finally {
      setGenerating(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await ideasAPI.updateStatus(id, status);
      setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const deleteIdea = async (id) => {
    try {
      await ideasAPI.delete(id);
      setIdeas((prev) => prev.filter((i) => i.id !== id));
      toast.success('Deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Video Ideas</h1>
          <p className="text-gray-400 text-sm mt-0.5">Track and manage your content pipeline</p>
        </div>
      </div>

      {/* Controls */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="Your channel name..."
            className="input flex-1"
            onKeyDown={(e) => e.key === 'Enter' && fetchIdeas()}
          />
          <button onClick={fetchIdeas} disabled={loading} className="btn-secondary flex items-center gap-2 whitespace-nowrap">
            <CheckCircle className="w-4 h-4" />
            Load Ideas
          </button>
          <button onClick={generateIdeas} disabled={generating} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            {generating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Lightbulb className="w-4 h-4" />
            )}
            Generate 10 Ideas
          </button>
        </div>

        <div className="flex gap-2 mt-3 flex-wrap">
          <button
            onClick={() => setFilterStatus('')}
            className={`tab text-xs ${!filterStatus ? 'tab-active' : 'tab-inactive'}`}
          >All</button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`tab text-xs capitalize ${filterStatus === s ? 'tab-active' : 'tab-inactive'}`}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Ideas Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-yt-border border-t-red-500 rounded-full animate-spin" />
        </div>
      ) : ideas.length === 0 ? (
        <div className="card p-12 text-center">
          <Lightbulb className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No ideas yet</p>
          <p className="text-gray-600 text-sm mt-1">Enter your channel name and generate ideas to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ideas.map((idea) => (
            <div key={idea.id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm leading-snug flex-1">{idea.title}</h3>
                <button onClick={() => deleteIdea(idea.id)} className="text-gray-600 hover:text-red-400 transition-colors p-0.5 shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {idea.concept && (
                <p className="text-xs text-gray-400 leading-relaxed">{idea.concept}</p>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                {idea.estimatedViews && (
                  <span className="badge bg-green-900/30 text-green-400 text-xs">{idea.estimatedViews}</span>
                )}
                <span className={`badge text-xs capitalize ${DIFFICULTY_COLORS[idea.difficulty] || 'bg-gray-700 text-gray-300'}`}>
                  {idea.difficulty}
                </span>
                {idea.platform && (
                  <span className="badge bg-yt-border text-gray-400 text-xs flex items-center gap-1">
                    <Youtube className="w-3 h-3" />{idea.platform}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">Status:</span>
                <select
                  value={idea.status}
                  onChange={(e) => updateStatus(idea.id, e.target.value)}
                  className="text-xs bg-yt-border border border-yt-border rounded px-2 py-1 text-white outline-none"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="capitalize">{s}</option>
                  ))}
                </select>
                <span className={`badge text-xs capitalize ml-auto ${STATUS_COLORS[idea.status] || 'bg-gray-700 text-gray-300'}`}>
                  {idea.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
