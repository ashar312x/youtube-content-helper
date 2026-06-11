import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, Video, FileText, Hash, Wand2, Film, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="text-gray-400 hover:text-white transition-colors p-1 rounded">
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

function Section({ icon: Icon, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center">
            <Icon className="w-4 h-4 text-red-400" />
          </div>
          <span className="font-semibold">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 border-t border-yt-border pt-4">{children}</div>}
    </div>
  );
}

const PLATFORM_INFO = {
  capcut: { label: 'CapCut AI', color: 'bg-black text-white', emoji: '✂️' },
  runway: { label: 'Runway ML', color: 'bg-purple-900/50 text-purple-300', emoji: '🎬' },
  pika: { label: 'Pika Labs', color: 'bg-blue-900/50 text-blue-300', emoji: '⚡' },
  sora: { label: 'Sora', color: 'bg-green-900/50 text-green-300', emoji: '🌐' },
  invideo: { label: 'InVideo AI', color: 'bg-orange-900/50 text-orange-300', emoji: '📹' },
};

export default function ContentDisplay({ content }) {
  if (!content) return null;

  const data = content.data || content;

  return (
    <div className="space-y-3">
      {/* Titles */}
      <Section icon={Video} title="Video Titles" defaultOpen>
        <div className="space-y-2">
          {(data.titles || []).map((title, i) => (
            <div key={i} className="flex items-start gap-3 bg-yt-border/50 rounded-lg px-3 py-2.5">
              <span className="text-xs text-red-400 font-bold mt-0.5 w-5 shrink-0">{i + 1}</span>
              <span className="text-sm flex-1">{title}</span>
              <CopyButton text={title} />
            </div>
          ))}
        </div>
      </Section>

      {/* Description */}
      <Section icon={FileText} title="Video Description">
        <div className="relative">
          <pre className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-sans">
            {data.description}
          </pre>
          <div className="mt-2 flex justify-end">
            <CopyButton text={data.description} />
          </div>
        </div>
      </Section>

      {/* Hashtags */}
      <Section icon={Hash} title="Hashtags">
        <div className="flex flex-wrap gap-2">
          {(data.hashtags || []).map((tag, i) => (
            <button
              key={i}
              onClick={() => { navigator.clipboard.writeText(tag); toast.success('Copied!'); }}
              className="badge bg-yt-border hover:bg-red-600/20 hover:text-red-300 text-gray-300 cursor-pointer transition-colors py-1 px-2.5 text-sm"
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="mt-3 flex justify-end">
          <CopyButton text={(data.hashtags || []).join(' ')} />
        </div>
      </Section>

      {/* Platform Prompts */}
      <Section icon={Wand2} title="AI Video Generation Prompts">
        <div className="space-y-3">
          {Object.entries(data.platformPrompts || {}).map(([platform, prompt]) => {
            const info = PLATFORM_INFO[platform] || { label: platform, color: 'bg-gray-700 text-gray-300', emoji: '🤖' };
            return (
              <div key={platform} className="bg-yt-border/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className={`badge ${info.color} text-xs`}>
                    {info.emoji} {info.label}
                  </span>
                  <CopyButton text={prompt} />
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{prompt}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Reel Script */}
      <Section icon={Film} title="Reel / Shorts Script">
        <div className="relative">
          <pre className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-sans bg-yt-border/30 rounded-lg p-3">
            {data.reelScript}
          </pre>
          <div className="mt-2 flex justify-end">
            <CopyButton text={data.reelScript} />
          </div>
        </div>
      </Section>

      {/* Video Ideas */}
      <Section icon={Lightbulb} title="Video Ideas">
        <div className="space-y-2">
          {(data.videoIdeas || []).map((idea, i) => (
            <div key={i} className="bg-yt-border/50 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-medium text-sm">{idea.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{idea.concept}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="badge bg-green-900/50 text-green-300 text-xs">{idea.estimatedViews}</span>
                  <span className={`badge text-xs ${
                    idea.difficulty === 'easy' ? 'bg-blue-900/50 text-blue-300' :
                    idea.difficulty === 'hard' ? 'bg-red-900/50 text-red-300' :
                    'bg-yellow-900/50 text-yellow-300'
                  }`}>{idea.difficulty}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
