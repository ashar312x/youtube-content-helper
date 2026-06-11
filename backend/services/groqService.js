const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = 'llama-3.3-70b-versatile';

async function generateContent(channelName, topic = '') {
  const topicLine = topic ? `The video topic is: "${topic}".` : 'Generate based on the channel niche.';

  const prompt = `You are an expert YouTube content strategist. For the YouTube channel named "${channelName}", ${topicLine}

Generate the following in valid JSON format (no markdown, no code blocks, pure JSON):
{
  "titles": ["title1", "title2", "title3", "title4", "title5"],
  "description": "A compelling 150-200 word video description with keywords naturally embedded, ending with a call to action.",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5", "#hashtag6", "#hashtag7", "#hashtag8", "#hashtag9", "#hashtag10"],
  "platformPrompts": {
    "capcut": "Detailed CapCut AI video generation prompt with style, mood, transitions, and visual elements described",
    "runway": "Detailed Runway ML video generation prompt focusing on cinematic quality, camera movement, and visual style",
    "pika": "Detailed Pika Labs video generation prompt with animation style and visual details",
    "sora": "Detailed Sora video generation prompt with scene description and visual narrative",
    "invideo": "Detailed InVideo AI prompt optimized for YouTube content creation"
  },
  "reelScript": "A complete 60-90 second YouTube Shorts/Reel script with hook (0-3s), main content breakdown with timestamps, and call to action. Include speaker notes and visual cues.",
  "videoIdeas": [
    {"title": "idea title 1", "concept": "brief concept explanation", "estimatedViews": "100K-500K", "difficulty": "easy"},
    {"title": "idea title 2", "concept": "brief concept explanation", "estimatedViews": "50K-200K", "difficulty": "medium"},
    {"title": "idea title 3", "concept": "brief concept explanation", "estimatedViews": "200K-1M", "difficulty": "hard"},
    {"title": "idea title 4", "concept": "brief concept explanation", "estimatedViews": "10K-50K", "difficulty": "easy"},
    {"title": "idea title 5", "concept": "brief concept explanation", "estimatedViews": "500K-2M", "difficulty": "medium"}
  ]
}`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 4096,
  });

  const raw = response.choices[0].message.content.trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse AI response as JSON');
  return JSON.parse(jsonMatch[0]);
}

async function generateVideoIdeas(channelName, count = 10) {
  const prompt = `You are a viral YouTube content strategist. Generate ${count} unique video ideas for the channel "${channelName}".

Return valid JSON only (no markdown):
{
  "ideas": [
    {
      "title": "Catchy video title",
      "concept": "2-3 sentence explanation of what the video covers",
      "estimatedViews": "view range estimate",
      "difficulty": "easy|medium|hard",
      "platform": "YouTube|YouTube Shorts|Both"
    }
  ]
}`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.9,
    max_tokens: 3000,
  });

  const raw = response.choices[0].message.content.trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse AI response');
  return JSON.parse(jsonMatch[0]);
}

async function generateEmailSummary(channelName, ideas) {
  const ideasText = ideas.map((i, idx) => `${idx + 1}. ${i.title} - ${i.concept}`).join('\n');

  const prompt = `Write a motivating, action-oriented email body (HTML format) for a YouTube creator running the channel "${channelName}".
The email should encourage them to create and upload videos using CapCut for editing and posting to YouTube.

Include these video ideas:
${ideasText}

Keep it under 300 words. Include emojis. Make it feel personal and exciting. Return only the HTML body content (no head/html tags).`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0].message.content.trim();
}

module.exports = { generateContent, generateVideoIdeas, generateEmailSummary };
