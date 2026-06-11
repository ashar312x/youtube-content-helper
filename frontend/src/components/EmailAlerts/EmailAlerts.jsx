import { useState } from 'react';
import { Mail, Bell, Send, CheckCircle } from 'lucide-react';
import { emailAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function EmailAlerts({ channelName, content }) {
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [alertType, setAlertType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [sendNowLoading, setSendNowLoading] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email || !channelName) return;
    setLoading(true);
    try {
      await emailAPI.subscribe(email, channelName, frequency, alertType);
      toast.success('Email alert subscribed!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  const sendTest = async () => {
    if (!email) { toast.error('Enter an email first'); return; }
    setTestLoading(true);
    try {
      await emailAPI.sendTest(email);
      toast.success('Test email sent!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send test email');
    } finally {
      setTestLoading(false);
    }
  };

  const sendNow = async () => {
    if (!channelName) { toast.error('Generate content first'); return; }
    setSendNowLoading(true);
    try {
      const res = await emailAPI.sendNow(channelName, content?.data);
      toast.success(res.message || 'Alert sent!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'No subscribers found');
    } finally {
      setSendNowLoading(false);
    }
  };

  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-red-600/20 rounded-lg flex items-center justify-center">
          <Bell className="w-4 h-4 text-red-400" />
        </div>
        <div>
          <h3 className="font-semibold">Email Alerts</h3>
          <p className="text-xs text-gray-400">Get reminders to create & upload videos</p>
        </div>
      </div>

      <form onSubmit={subscribe} className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-400 block mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input text-sm py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-gray-400 block mb-1">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="input text-sm py-2"
            >
              <option value="immediate">Immediate</option>
              <option value="daily">Daily (9 AM)</option>
              <option value="weekly">Weekly (Mon 8 AM)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-400 block mb-1">Alert Type</label>
            <select
              value={alertType}
              onChange={(e) => setAlertType(e.target.value)}
              className="input text-sm py-2"
            >
              <option value="all">All Alerts</option>
              <option value="video_idea">Video Ideas</option>
              <option value="content_ready">Content Ready</option>
              <option value="upload_reminder">Upload Reminder</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading || !email || !channelName} className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2">
          {loading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
          Subscribe Alerts
        </button>
      </form>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <button onClick={sendTest} disabled={testLoading || !email} className="btn-secondary flex items-center justify-center gap-1.5 text-xs py-2">
          {testLoading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Mail className="w-3 h-3" />}
          Test Email
        </button>
        <button onClick={sendNow} disabled={sendNowLoading || !channelName} className="btn-secondary flex items-center justify-center gap-1.5 text-xs py-2">
          {sendNowLoading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-3 h-3" />}
          Send Now
        </button>
      </div>

      <div className="mt-3 bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-3">
        <p className="text-xs text-yellow-400">
          <strong>CapCut Workflow:</strong> Get email → Open CapCut with the AI prompt → Edit video → Upload to YouTube with the generated title & description
        </p>
      </div>
    </div>
  );
}
