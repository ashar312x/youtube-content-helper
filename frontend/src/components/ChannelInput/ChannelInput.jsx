import { useState } from 'react';
import { Sparkles, Youtube } from 'lucide-react';

export default function ChannelInput({ onGenerate, isGenerating }) {
  const [channelName, setChannelName] = useState('');
  const [topic, setTopic] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!channelName.trim()) return;
    onGenerate(channelName.trim(), topic.trim());
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
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="e.g. TechWithMike, CookingWithSarah..."
            className="input"
            disabled={isGenerating}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Video Topic <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Top 10 AI tools in 2025, How to make passive income..."
            className="input"
            disabled={isGenerating}
          />
          <p className="text-xs text-gray-500 mt-1">Leave blank to generate based on channel niche</p>
        </div>

        <button
          type="submit"
          disabled={isGenerating || !channelName.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
