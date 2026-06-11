import { useState } from 'react';
import ChannelInput from '../components/ChannelInput/ChannelInput';
import BatchInput from '../components/BatchInput/BatchInput';
import ContentDisplay from '../components/ContentDisplay/ContentDisplay';
import EmailAlerts from '../components/EmailAlerts/EmailAlerts';
import { contentAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import { TrendingUp, Zap, Mail, Layers } from 'lucide-react';

export default function Dashboard() {
  const { selectedChannel, setChannel } = useApp();
  const [channelName, setChannelName] = useState(selectedChannel || '');
  const [content, setContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [batchMode, setBatchMode] = useState(false);

  const handleGenerate = async (name, topic) => {
    setChannelName(name);
    setChannel(name);
    setIsGenerating(true);
    try {
      const result = await contentAPI.generate(name, topic);
      setContent(result);
      toast.success('Content generated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBatchComplete = (succeeded) => {
    if (succeeded.length > 0) {
      toast.success(`${succeeded.length} packages saved to History`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center py-4">
        <h1 className="text-3xl font-bold mb-2">
          YouTube Content <span className="text-red-500">Generator</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-sm">
          Enter your channel name and get AI-generated titles, descriptions, hashtags, CapCut prompts, reel scripts, and video ideas — instantly.
        </p>
        <div className="flex items-center justify-center gap-6 mt-3 text-sm text-gray-500">
          <div className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-red-400" /> SEO-Scored Titles</div>
          <div className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-yellow-400" /> CapCut Prompts</div>
          <div className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-blue-400" /> Email Alerts</div>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setBatchMode(false)}
            className={`tab text-sm flex items-center gap-1.5 ${!batchMode ? 'tab-active' : 'tab-inactive'}`}
          >
            <Zap className="w-3.5 h-3.5" /> Single
          </button>
          <button
            onClick={() => setBatchMode(true)}
            className={`tab text-sm flex items-center gap-1.5 ${batchMode ? 'tab-active' : 'tab-inactive'}`}
          >
            <Layers className="w-3.5 h-3.5" /> Batch (up to 10)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-4">
          {batchMode ? (
            <BatchInput onComplete={handleBatchComplete} />
          ) : (
            <>
              <ChannelInput onGenerate={handleGenerate} isGenerating={isGenerating} />
              <EmailAlerts channelName={channelName} content={content} />
            </>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
          {!content && !isGenerating && (
            <div className="card p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="w-16 h-16 bg-yt-border rounded-2xl flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-gray-400 font-semibold mb-2">Ready to Generate</h3>
              <p className="text-gray-600 text-sm max-w-xs">
                {batchMode
                  ? 'Enter topics on the left and run batch generation. Results are saved to History.'
                  : 'Enter your channel name and click Generate to get your complete content package.'}
              </p>
            </div>
          )}

          {isGenerating && (
            <div className="card p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="w-12 h-12 border-4 border-yt-border border-t-red-500 rounded-full animate-spin mb-4" />
              <p className="text-gray-300 font-semibold">Groq AI is generating your content...</p>
              <p className="text-gray-500 text-sm mt-1">Llama 3.3-70B · Usually takes 3–8 seconds</p>
            </div>
          )}

          {content && !isGenerating && (
            <ContentDisplay
              content={content}
              channelName={channelName}
            />
          )}
        </div>
      </div>
    </div>
  );
}
