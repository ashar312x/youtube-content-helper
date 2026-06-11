import { useState } from 'react';
import {
  Copy, Check, ChevronDown, ChevronUp, Video, FileText, Hash, Wand2, Film,
  Lightbulb, RefreshCw, Download, Package, Image, Mic, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { scoreTitle, scoreDescription, scoreHashtags, getScoreColor, getGradeColor } from '../../utils/seoScorer';
import { contentAPI } from '../../services/api';

function CopyButton({ text, size = 'sm' }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };
  const cls = size === 'xs' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <button onClick={copy} className="text-gray-400 hover:text-white transition-colors p-1 rounded shrink-0">
      {copied ? <Check className={`${cls} text-green-400`} /> : <Copy className={cls} />}
    </button>
  );
}

function Section({ icon: Icon, title, children, defaultOpen = false, badge = null }) {
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
          {badge && <span className="badge bg-yt-border text-gray-400 text-xs">{badge}</span>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 border-t border-yt-border pt-4">{children}</div>}
    </div>
  );
}

const PLATFORM_INFO = {
  capcut: { label: 'CapCut AI', color: 'bg-black text-white border border-gray-700', emoji: '✂️' },
  runway: { label: 'Runway ML', color: 'bg-purple-900/50 text-purple-300', emoji: '🎬' },
  pika: { label: 'Pika Labs', color: 'bg-blue-900/50 text-blue-300', emoji: '⚡' },
  sora: { label: 'Sora', color: 'bg-green-900/50 text-green-300', emoji: '🌐' },
  invideo: { label: 'InVideo AI', color: 'bg-orange-900/50 text-orange-300', emoji: '📹' },
};

const INTEREST_COLORS = {
  high: 'bg-red-900/50 text-red-300',
  medium: 'bg-yellow-900/50 text-yellow-300',
  rising: 'bg-green-900/50 text-green-300',
};

function ExportBar({ data, channelName }) {
  const buildFullText = () => {
    const sections = [
      `=== YOUTUBE CONTENT PACKAGE ===`,
      `Channel: ${channelName}`,
      data.topic ? `Topic: ${data.topic}` : '',
      ``,
      `--- CAPCUT PROMPT ---`,
      data.platformPrompts?.capcut || '',
      ``,
      `--- REEL / SHORTS SCRIPT ---`,
      data.reelScript || '',
      ``,
      `--- VIDEO TITLES ---`,
      ...(data.titles || []).map((t, i) => `${i + 1}. ${t}`),
      ``,
      `--- DESCRIPTION ---`,
      data.description || '',
      ``,
      `--- HASHTAGS ---`,
      (data.hashtags || []).join(' '),
    ].join('\n');
    return sections;
  };

  const copyAll = () => {
    navigator.clipboard.writeText(buildFullText());
    toast.success('Full package copied!');
  };

  const downloadTxt = () => {
    const blob = new Blob([buildFullText()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${channelName || 'content'}-package.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  return (
    <div className="card p-3 flex items-center justify-between gap-3 bg-gradient-to-r from-red-950/30 to-yt-card border-red-900/30">
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-red-400" />
        <span className="text-sm font-medium">Export Full Package</span>
        <span className="text-xs text-gray-500">(CapCut-workflow order)</span>
      </div>
      <div className="flex gap-2">
        <button onClick={copyAll} className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3">
          <Copy className="w-3.5 h-3.5" /> Copy All
        </button>
        <button onClick={downloadTxt} className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3">
          <Download className="w-3.5 h-3.5" /> .txt
        </button>
      </div>
    </div>
  );
}

export default function ContentDisplay({ content, channelName, onTitlesRegenerated }) {
  const [titles, setTitles] = useState(null);
  const [thumbnailBriefs, setThumbnailBriefs] = useState(null);
  const [voiceoverScript, setVoiceoverScript] = useState(null);
  const [regeneratingTitles, setRegeneratingTitles] = useState(false);
  const [generatingThumbnails, setGeneratingThumbnails] = useState(false);
  const [generatingVoiceover, setGeneratingVoiceover] = useState(false);

  if (!content) return null;

  const data = content.data || content;
  const contentId = data.id || null;
  const activeTitles = titles || data.titles || [];
  const activeThumbnailBriefs = thumbnailBriefs || data.thumbnailBriefs || null;
  const activeVoiceover = voiceoverScript || data.voiceoverScript || null;
  const topic = data.topic || '';

  const regenerateTitles = async () => {
    setRegeneratingTitles(true);
    try {
      const res = await contentAPI.regenerateTitles(channelName, topic, contentId);
      setTitles(res.data.titles);
      if (onTitlesRegenerated) onTitlesRegenerated(res.data.titles);
      toast.success('Titles regenerated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to regenerate');
    } finally {
      setRegeneratingTitles(false);
    }
  };

  const generateThumbnails = async () => {
    setGeneratingThumbnails(true);
    try {
      const res = await contentAPI.generateThumbnails(activeTitles, channelName, contentId);
      setThumbnailBriefs(res.data);
      toast.success('Thumbnail briefs generated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setGeneratingThumbnails(false);
    }
  };

  const generateVoiceover = async () => {
    setGeneratingVoiceover(true);
    try {
      const res = await contentAPI.generateVoiceover(channelName, topic, data.description, contentId);
      setVoiceoverScript(res.data.voiceoverScript);
      toast.success('Voiceover script generated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setGeneratingVoiceover(false);
    }
  };

  const descStats = scoreDescription(data.description);
  const tagStats = scoreHashtags(data.hashtags);

  return (
    <div className="space-y-3">
      {/* Export bar */}
      <ExportBar data={data} channelName={channelName} />

      {/* Titles with SEO scores + regenerate */}
      <Section icon={Video} title="Video Titles" defaultOpen badge={`${activeTitles.length} titles`}>
        <div className="flex justify-end mb-2">
          <button
            onClick={regenerateTitles}
            disabled={regeneratingTitles}
            className="btn-secondary flex items-center gap-1.5 text-xs py-1.5"
          >
            {regeneratingTitles
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <RefreshCw className="w-3 h-3" />}
            Regenerate Titles
          </button>
        </div>
        <div className="space-y-2">
          {activeTitles.map((title, i) => {
            const { score } = scoreTitle(title);
            const colorCls = getScoreColor(score);
            return (
              <div key={i} className="flex items-start gap-2 bg-yt-border/50 rounded-lg px-3 py-2.5">
                <span className="text-xs text-red-400 font-bold mt-0.5 w-5 shrink-0">{i + 1}</span>
                <span className="text-sm flex-1">{title}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`badge text-xs font-bold ${colorCls}`}>{score}</span>
                  <CopyButton text={title} size="xs" />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-600 mt-2">Score: 0–100 based on length, power words, numbers & curiosity gap</p>
      </Section>

      {/* Description with grade */}
      <Section icon={FileText} title="Video Description" badge={`${descStats.wordCount}w · ${descStats.grade}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`badge text-xs ${getGradeColor(descStats.grade)}`}>
            {descStats.wordCount} words · {descStats.grade}
          </span>
          <span className="text-xs text-gray-600">{descStats.charCount} chars</span>
        </div>
        <pre className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-sans">
          {data.description}
        </pre>
        <div className="mt-2 flex justify-end">
          <CopyButton text={data.description} />
        </div>
      </Section>

      {/* Hashtags with grade */}
      <Section icon={Hash} title="Hashtags" badge={`${tagStats.count} tags · ${tagStats.grade}`}>
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
        <div className="mt-3 flex items-center justify-between">
          <span className={`badge text-xs ${getGradeColor(tagStats.grade)}`}>{tagStats.count} hashtags · {tagStats.grade}</span>
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
                  <span className={`badge ${info.color} text-xs`}>{info.emoji} {info.label}</span>
                  <CopyButton text={prompt} />
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{prompt}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Thumbnail Briefs (on-demand) */}
      <Section icon={Image} title="Thumbnail Briefs">
        {!activeThumbnailBriefs ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-400 mb-3">Generate CapCut-optimized thumbnail briefs for each title</p>
            <button
              onClick={generateThumbnails}
              disabled={generatingThumbnails}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              {generatingThumbnails
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                : <><Image className="w-4 h-4" /> Generate Thumbnail Briefs</>}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeThumbnailBriefs.map((brief, i) => (
              <div key={i} className="bg-yt-border/50 rounded-lg p-3 space-y-2">
                <p className="text-sm font-medium text-gray-200">{brief.title}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500 block">Overlay Text</span>
                    <span className="text-white font-bold">{brief.overlayText}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Emotion / Hook</span>
                    <span className="text-gray-300">{brief.emotionHook}</span>
                  </div>
                </div>
                <div className="text-xs">
                  <span className="text-gray-500 block mb-1">Visual Concept (for CapCut AI)</span>
                  <span className="text-gray-300">{brief.visualConcept}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {(brief.colorPalette || []).map((hex, j) => (
                      <div
                        key={j}
                        title={hex}
                        className="w-5 h-5 rounded border border-yt-border cursor-pointer"
                        style={{ backgroundColor: hex }}
                        onClick={() => { navigator.clipboard.writeText(hex); toast.success(`Copied ${hex}`); }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-yellow-400 italic">{brief.capCutTip}</span>
                </div>
              </div>
            ))}
            <button onClick={generateThumbnails} disabled={generatingThumbnails} className="btn-secondary text-xs flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3" /> Regenerate
            </button>
          </div>
        )}
      </Section>

      {/* Reel Script */}
      <Section icon={Film} title="Reel / Shorts Script">
        <pre className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-sans bg-yt-border/30 rounded-lg p-3">
          {data.reelScript}
        </pre>
        <div className="mt-2 flex justify-end">
          <CopyButton text={data.reelScript} />
        </div>
      </Section>

      {/* Voiceover Script (on-demand) */}
      <Section icon={Mic} title="Full Voiceover Script">
        {!activeVoiceover ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-400 mb-1">Long-form narration script (8–12 min)</p>
            <p className="text-xs text-gray-600 mb-3">Natural spoken prose with pause markers — designed for reading aloud</p>
            <button
              onClick={generateVoiceover}
              disabled={generatingVoiceover}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              {generatingVoiceover
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                : <><Mic className="w-4 h-4" /> Generate Voiceover Script</>}
            </button>
          </div>
        ) : (
          <div>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-sans bg-yt-border/30 rounded-lg p-3 max-h-96 overflow-y-auto">
              {activeVoiceover}
            </pre>
            <div className="mt-2 flex justify-end gap-2">
              <button onClick={generateVoiceover} disabled={generatingVoiceover} className="btn-secondary text-xs flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3" /> Regenerate
              </button>
              <CopyButton text={activeVoiceover} />
            </div>
          </div>
        )}
      </Section>

      {/* Video Ideas */}
      <Section icon={Lightbulb} title="Video Ideas" badge={`${(data.videoIdeas || []).length} ideas`}>
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
