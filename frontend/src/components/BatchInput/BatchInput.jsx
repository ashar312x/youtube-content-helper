import { useState } from 'react';
import { Layers, Loader2, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { contentAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

export default function BatchInput({ onComplete }) {
  const { selectedChannel } = useApp();
  const [channelName, setChannelName] = useState(selectedChannel || '');
  const [topicsText, setTopicsText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(null);

  const topics = topicsText.split('\n').map((t) => t.trim()).filter(Boolean);

  const handleGenerate = async () => {
    if (!channelName.trim() || topics.length === 0) return;
    if (topics.length > 10) { toast.error('Max 10 topics per batch'); return; }

    setIsGenerating(true);
    setProgress(null);

    toast.loading(`Generating ${topics.length} content packages...`, { id: 'batch' });

    try {
      const res = await contentAPI.batchGenerate(channelName.trim(), topics);
      const { succeeded, failed } = res.data;

      toast.dismiss('batch');
      toast.success(`${succeeded.length}/${topics.length} packages generated!`);

      setProgress({ succeeded, failed });
      if (onComplete) onComplete(succeeded);
    } catch (err) {
      toast.dismiss('batch');
      toast.error(err.response?.data?.error || 'Batch generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
          <Layers className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Batch Generator</h2>
          <p className="text-sm text-gray-400">Generate up to 10 content packages at once</p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-300 block mb-1.5">Channel Name</label>
        <input
          type="text"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          placeholder="Your channel name..."
          className="input"
          disabled={isGenerating}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-gray-300">Topics (one per line)</label>
          <span className={`text-xs font-medium ${topics.length > 10 ? 'text-red-400' : 'text-gray-500'}`}>
            {topics.length}/10
          </span>
        </div>
        <textarea
          value={topicsText}
          onChange={(e) => setTopicsText(e.target.value)}
          placeholder={`How to make money online in 2025\nBest AI tools for creators\nPassive income for beginners\nYouTube growth strategy\n...`}
          rows={6}
          className="input resize-none font-mono text-sm"
          disabled={isGenerating}
        />
        <p className="text-xs text-gray-600 mt-1">Each line = one content package. Groq AI processes them concurrently.</p>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !channelName.trim() || topics.length === 0 || topics.length > 10}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3"
      >
        {isGenerating ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Generating {topics.length} packages...</>
        ) : (
          <><Layers className="w-4 h-4" /> Generate {topics.length || '0'} Content Packages</>
        )}
      </button>

      {/* Progress results */}
      {progress && (
        <div className="space-y-2 pt-2 border-t border-yt-border">
          <p className="text-sm font-medium">
            Results: <span className="text-green-400">{progress.succeeded.length} succeeded</span>
            {progress.failed.length > 0 && <span className="text-red-400 ml-2">{progress.failed.length} failed</span>}
          </p>
          {progress.succeeded.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
              <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
              <span className="truncate">{item.topic || `Package ${i + 1}`}</span>
              <span className="text-gray-600 shrink-0">{item.titles?.[0]?.slice(0, 40)}...</span>
            </div>
          ))}
          {progress.failed.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-red-400">
              <XCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{item.topic}: {item.error}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
