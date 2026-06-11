import { useState } from 'react';
import { Sparkles, Youtube, TrendingUp, Loader2, ChevronDown } from 'lucide-react';
import { contentAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

export default function ChannelInput({ onGenerate, isGenerating }) {
  const { selectedChannel, setChannel, recentChannels } = useApp();
  const [channelName, setChannelNameLocal] = useState(selectedChannel || '');
  const [topic, setTopic] = useState('');
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [showTrending, setShowTrending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!channelName.trim()) return;
    setChannel(channelName.trim());
    onGenerate(channelName.trim(), topic.trim());
  };

  const handleChannelChange = (val) => {
    setChannelNameLocal(val);
  };

  const fetchTrending = async () => {
    const niche = channelName.trim() || 'general';
    setLoadingTrending(true);
    setShowTrending(false);
    try {
      const res = await contentAPI.getTrending(niche);
      setTrendingTopics(res.data || []);
      setShowTrending(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to fetch trends');
    } finally {
      setLoadingTrending(false);
    }
  };

  const selectTopic = (title) => {
    setTopic(title);
    setShowTrending(false);
  };

  const INTEREST_COLORS = {
    high: 'text-red-400 bg-red-900/30',
    medium: 'text-yellow-400 bg-yellow-900/30',
    rising: 'text-green-400 bg-green-900/30',
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center">
          <Youtube className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Content Generator</h2>
          <p className="text-sm text-gray-400">Powered by Groq AI (Llama 3.3-70B)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            YouTube Channel Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            list="recent-channels"
            value={channelName}
            onChange={(e) => handleChannelChange(e.target.value)}
            placeholder="e.g. TechWithMike, CookingWithSarah..."
            className="input"
            disabled={isGenerating}
          />
          <datalist id="recent-channels">
            {recentChannels.map((ch) => (
              <option key={ch} value={ch} />
            ))}
          </datalist>
          {recentChannels.length > 0 && (
            <p className="text-xs text-gray-600 mt-1">Recent: {recentChannels.slice(0, 3).join(', ')}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-300">
              Video Topic <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <button
              type="button"
              onClick={fetchTrending}
              disabled={loadingTrending || isGenerating}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
            >
              {loadingTrending
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <TrendingUp className="w-3 h-3" />}
              {loadingTrending ? 'Loading...' : 'Get Trending'}
            </button>
          </div>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Top 10 AI tools in 2025, How to make passive income..."
            className="input"
            disabled={isGenerating}
          />

          {/* Trending dropdown */}
          {showTrending && trendingTopics.length > 0 && (
            <div className="mt-2 card border-red-900/30 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-yt-border bg-red-950/20">
                <span className="text-xs font-semibold text-red-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Trending Topics for "{channelName || 'your niche'}"
                </span>
                <button type="button" onClick={() => setShowTrending(false)} className="text-gray-500 hover:text-white text-xs">✕</button>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-yt-border">
                {trendingTopics.map((t, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectTopic(t.title)}
                    className="w-full text-left px-3 py-2.5 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{t.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{t.trendReason}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`badge text-xs capitalize ${INTEREST_COLORS[t.interestLevel] || 'bg-gray-700 text-gray-300'}`}>
                          {t.interestLevel}
                        </span>
                        <span className="text-xs text-gray-600">{t.format}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-1">Leave blank to auto-generate based on channel niche</p>
        </div>

        <button
          type="submit"
          disabled={isGenerating || !channelName.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating with Groq AI...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Content Package
            </>
          )}
        </button>
      </form>
    </div>
  );
}
