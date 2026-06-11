import { useState } from 'react';
import { History, ChevronDown, ChevronUp, Trash2, Copy, Check } from 'lucide-react';
import { contentAPI } from '../services/api';
import toast from 'react-hot-toast';

function HistoryCard({ record, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAll = () => {
    const text = [
      `TITLE: ${(record.titles || [])[0] || ''}`,
      `\nDESCRIPTION:\n${record.description}`,
      `\nHASHTAGS:\n${(record.hashtags || []).join(' ')}`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{record.channelName}</p>
            {record.topic && <p className="text-xs text-gray-400 mt-0.5">Topic: {record.topic}</p>}
            <p className="text-xs text-gray-500 mt-1">
              {new Date(record.createdAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={copyAll} className="text-gray-400 hover:text-white transition-colors p-1.5 rounded">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button onClick={() => onDelete(record.id)} className="text-gray-500 hover:text-red-400 transition-colors p-1.5 rounded">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-white transition-colors p-1.5 rounded">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Preview titles */}
        {!expanded && (record.titles || []).length > 0 && (
          <p className="text-xs text-gray-400 mt-2 line-clamp-1">
            📌 {record.titles[0]}
          </p>
        )}
      </div>

      {expanded && (
        <div className="border-t border-yt-border px-4 pb-4 pt-3 space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-1.5">Titles</p>
            {(record.titles || []).map((t, i) => (
              <p key={i} className="text-xs text-gray-300 py-1 border-b border-yt-border/50 last:border-0">
                {i + 1}. {t}
              </p>
            ))}
          </div>
          {record.description && (
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-1.5">Description</p>
              <p className="text-xs text-gray-300 line-clamp-4">{record.description}</p>
            </div>
          )}
          {(record.hashtags || []).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {record.hashtags.slice(0, 8).map((tag, i) => (
                <span key={i} className="badge bg-yt-border text-gray-400 text-xs">{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const [channelName, setChannelName] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    if (!channelName.trim()) return;
    setLoading(true);
    try {
      const res = await contentAPI.history(channelName, 20);
      setHistory(res.data?.rows || []);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id) => {
    try {
      await contentAPI.delete(id);
      setHistory((prev) => prev.filter((r) => r.id !== id));
      toast.success('Deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Generation History</h1>
        <p className="text-gray-400 text-sm mt-0.5">Browse past generated content for your channels</p>
      </div>

      <div className="card p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="Enter channel name..."
            className="input flex-1"
            onKeyDown={(e) => e.key === 'Enter' && fetchHistory()}
          />
          <button onClick={fetchHistory} disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <History className="w-4 h-4" />
            )}
            Load History
          </button>
        </div>
      </div>

      {history.length === 0 && !loading ? (
        <div className="card p-12 text-center">
          <History className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No history yet</p>
          <p className="text-gray-600 text-sm mt-1">Enter a channel name and load its generation history</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((record) => (
            <HistoryCard key={record.id} record={record} onDelete={deleteRecord} />
          ))}
        </div>
      )}
    </div>
  );
}
