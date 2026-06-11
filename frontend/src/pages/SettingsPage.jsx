import { useState } from 'react';
import { Settings, Mail, Bell, Youtube, Zap, ExternalLink, Users, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { emailAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

function SubscriptionManager() {
  const { selectedChannel } = useApp();
  const [lookupChannel, setLookupChannel] = useState(selectedChannel || '');
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState({});

  const load = async () => {
    if (!lookupChannel.trim()) return;
    setLoading(true);
    try {
      const res = await emailAPI.subscriptions(lookupChannel);
      setSubscriptions(res.data || []);
    } catch {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (sub) => {
    setToggling((p) => ({ ...p, [sub.id]: true }));
    try {
      if (sub.isActive) {
        await emailAPI.deactivate(sub.id);
      } else {
        await emailAPI.reactivate(sub.id);
      }
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === sub.id ? { ...s, isActive: !s.isActive } : s))
      );
      toast.success(sub.isActive ? 'Deactivated' : 'Reactivated');
    } catch {
      toast.error('Failed to update');
    } finally {
      setToggling((p) => ({ ...p, [sub.id]: false }));
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 bg-purple-600/20 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="font-semibold">Manage Subscriptions</h2>
          <p className="text-xs text-gray-400">View and toggle active email alert subscriptions</p>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={lookupChannel}
          onChange={(e) => setLookupChannel(e.target.value)}
          placeholder="Channel name..."
          className="input flex-1 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <button onClick={load} disabled={loading} className="btn-secondary flex items-center gap-1.5 text-sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
          Load
        </button>
      </div>

      {subscriptions.length === 0 && !loading ? (
        <p className="text-sm text-gray-500 text-center py-4">No subscriptions found for this channel</p>
      ) : (
        <div className="space-y-2">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between bg-yt-border/50 rounded-lg px-3 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{sub.email}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500 capitalize">{sub.frequency}</span>
                  <span className="text-gray-700">·</span>
                  <span className="text-xs text-gray-500 capitalize">{sub.alertType}</span>
                  {sub.lastSentAt && (
                    <>
                      <span className="text-gray-700">·</span>
                      <span className="text-xs text-gray-600">
                        Last sent {new Date(sub.lastSentAt).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => toggle(sub)}
                disabled={toggling[sub.id]}
                className={`shrink-0 transition-colors ${sub.isActive ? 'text-green-400 hover:text-red-400' : 'text-gray-600 hover:text-green-400'}`}
              >
                {toggling[sub.id]
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : sub.isActive
                    ? <ToggleRight className="w-6 h-6" />
                    : <ToggleLeft className="w-6 h-6" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { selectedChannel } = useApp();
  const [email, setEmail] = useState('');
  const [channelName, setChannelName] = useState(selectedChannel || '');
  const [frequency, setFrequency] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email || !channelName) return;
    setLoading(true);
    try {
      await emailAPI.subscribe(email, channelName, frequency, 'all');
      toast.success('Email alerts configured!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const sendTest = async () => {
    if (!email) { toast.error('Enter an email address'); return; }
    setTestLoading(true);
    try {
      await emailAPI.sendTest(email);
      toast.success('Test email sent!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send test');
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-400 text-sm mt-0.5">Configure email alerts and automation</p>
      </div>

      {/* Email Alerts Config */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold">Email Alert Configuration</h2>
            <p className="text-xs text-gray-400">Get scheduled reminders to create and upload content</p>
          </div>
        </div>

        <form onSubmit={subscribe} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1.5">Your Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1.5">Channel Name</label>
              <input type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} placeholder="YourChannelName" className="input" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">Notification Frequency</label>
            <div className="grid grid-cols-3 gap-2">
              {['immediate', 'daily', 'weekly'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border capitalize ${
                    frequency === f
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'bg-yt-border border-yt-border text-gray-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading || !email || !channelName} className="btn-primary flex items-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Bell className="w-4 h-4" />}
              Save Alert Settings
            </button>
            <button type="button" onClick={sendTest} disabled={testLoading || !email} className="btn-secondary flex items-center gap-2">
              {testLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Mail className="w-4 h-4" />}
              Send Test Email
            </button>
          </div>
        </form>
      </div>

      {/* Subscription Manager */}
      <SubscriptionManager />

      {/* YouTube Automation Roadmap */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-red-600/20 rounded-lg flex items-center justify-center">
            <Youtube className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="font-semibold">YouTube Automation (Coming Soon)</h2>
            <p className="text-xs text-gray-400">Future automation features roadmap</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { icon: '📹', title: 'Auto-Upload via YouTube API', desc: 'Connect your YouTube channel and auto-upload generated videos', ready: false },
            { icon: '🎬', title: 'CapCut Auto-Export', desc: 'Automatically export completed CapCut projects', ready: false },
            { icon: '📅', title: 'Content Scheduling', desc: 'Schedule uploads for optimal posting times based on analytics', ready: false },
            { icon: '📊', title: 'Analytics Dashboard', desc: 'Track video performance and optimize future content', ready: false },
            { icon: '🤖', title: 'AI Thumbnail Generation', desc: 'Auto-generate thumbnails using DALL-E or Midjourney', ready: false },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-yt-border/30 rounded-lg">
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1">
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <span className="badge bg-yellow-900/50 text-yellow-400 text-xs shrink-0">Soon</span>
            </div>
          ))}
        </div>
      </div>

      {/* Current Workflow */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-green-600/20 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h2 className="font-semibold">Current Workflow Guide</h2>
            <p className="text-xs text-gray-400">How to use this tool with CapCut + YouTube</p>
          </div>
        </div>

        <ol className="space-y-3">
          {[
            'Enter your channel name in the Generator tab',
            'Add an optional video topic or leave blank for ideas',
            'Click "Generate Content Package" to get AI-generated content',
            'Copy the CapCut AI prompt from the Platform Prompts section',
            'Open CapCut and use the AI Video Generator with your prompt',
            'Edit the video with the generated script & add captions',
            'Export in 1080p or 4K',
            'Upload to YouTube using the generated title, description & hashtags',
            'Set email alerts so you get reminded daily/weekly to create more videos',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
              <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>

        <div className="mt-4 pt-4 border-t border-yt-border flex flex-wrap gap-2">
          <a
            href="https://www.capcut.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open CapCut
          </a>
          <a
            href="https://studio.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" /> YouTube Studio
          </a>
        </div>
      </div>
    </div>
  );
}
