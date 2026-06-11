const POWER_WORDS = [
  'secret', 'proven', 'exposed', 'honest', 'free', 'ultimate', 'best', 'worst',
  'shocking', 'surprising', 'incredible', 'amazing', 'powerful', 'easy', 'fast',
  'simple', 'hack', 'trick', 'tip', 'strategy', 'mistake', 'warning', 'danger',
  'truth', 'lies', 'real', 'actually', 'never', 'always', 'instantly', 'exactly',
  'complete', 'perfect', 'essential', 'genius', 'insane', 'crazy', 'brutal',
  'raw', 'unfiltered', 'definitive', 'step-by-step', 'beginner', 'advanced',
];

const CURRENT_YEARS = ['2025', '2026'];

export function scoreTitle(title) {
  if (!title) return { score: 0, breakdown: {} };

  const len = title.length;
  const lower = title.toLowerCase();

  // Length score (45-70 chars is optimal): 0-25 pts
  let lengthScore = 0;
  if (len >= 45 && len <= 70) lengthScore = 25;
  else if (len >= 35 && len < 45) lengthScore = 18;
  else if (len > 70 && len <= 80) lengthScore = 18;
  else if (len >= 20 && len < 35) lengthScore = 10;
  else if (len > 80) lengthScore = 8;

  // Contains a number: +15 pts
  const hasNumber = /\d+/.test(title);
  const numberScore = hasNumber ? 15 : 0;

  // Power words: +8 per word, max 16 pts
  const matchedPowerWords = POWER_WORDS.filter((w) => lower.includes(w));
  const powerScore = Math.min(matchedPowerWords.length * 8, 16);

  // Year mention: +5 pts
  const hasYear = CURRENT_YEARS.some((y) => title.includes(y));
  const yearScore = hasYear ? 5 : 0;

  // Curiosity gap or question: +15 pts
  const hasCuriosity =
    title.includes('?') ||
    /\b(why|how|what|when|who|which|this is|you won't|i can't believe|nobody talks|they don't want)\b/i.test(title);
  const curiosityScore = hasCuriosity ? 15 : 0;

  // Brackets or parentheses (e.g. "(Honest Review)", "[2025]"): +5 pts
  const hasBrackets = /[\[\(]/.test(title);
  const bracketScore = hasBrackets ? 5 : 0;

  // All caps words (emphasis): +5 pts (but only if 1-2 words, not shouting)
  const capsWords = (title.match(/\b[A-Z]{2,}\b/g) || []).length;
  const capsScore = capsWords >= 1 && capsWords <= 2 ? 5 : 0;

  const total = Math.min(
    lengthScore + numberScore + powerScore + yearScore + curiosityScore + bracketScore + capsScore,
    100
  );

  return {
    score: total,
    breakdown: {
      length: { score: lengthScore, chars: len },
      number: { score: numberScore, found: hasNumber },
      powerWords: { score: powerScore, words: matchedPowerWords },
      year: { score: yearScore, found: hasYear },
      curiosity: { score: curiosityScore, found: hasCuriosity },
      brackets: { score: bracketScore, found: hasBrackets },
    },
  };
}

export function scoreDescription(text) {
  if (!text) return { wordCount: 0, charCount: 0, grade: 'poor' };
  const words = text.trim().split(/\s+/).length;
  const chars = text.length;
  let grade = 'poor';
  if (words >= 150 && words <= 250) grade = 'excellent';
  else if (words >= 100 && words < 150) grade = 'good';
  else if (words >= 50 && words < 100) grade = 'fair';
  return { wordCount: words, charCount: chars, grade };
}

export function scoreHashtags(tags) {
  const count = (tags || []).length;
  let grade = 'poor';
  if (count >= 8 && count <= 15) grade = 'excellent';
  else if (count >= 5 && count < 8) grade = 'good';
  else if (count >= 3 && count < 5) grade = 'fair';
  return { count, grade };
}

export function getScoreColor(score) {
  if (score >= 75) return 'text-green-400 bg-green-900/40';
  if (score >= 50) return 'text-yellow-400 bg-yellow-900/40';
  return 'text-red-400 bg-red-900/40';
}

export function getGradeColor(grade) {
  const map = {
    excellent: 'text-green-400 bg-green-900/40',
    good: 'text-blue-400 bg-blue-900/40',
    fair: 'text-yellow-400 bg-yellow-900/40',
    poor: 'text-red-400 bg-red-900/40',
  };
  return map[grade] || map.poor;
}
