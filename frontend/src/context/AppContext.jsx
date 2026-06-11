import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

const STORAGE_KEY = 'yt_helper_recent_channels';
const MAX_RECENT = 8;

function loadRecentChannels() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function AppProvider({ children }) {
  const [selectedChannel, setSelectedChannelState] = useState('');
  const [recentChannels, setRecentChannels] = useState(loadRecentChannels);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentChannels));
  }, [recentChannels]);

  const setChannel = (name) => {
    if (!name) return;
    setSelectedChannelState(name);
    setRecentChannels((prev) => {
      const deduped = [name, ...prev.filter((c) => c !== name)].slice(0, MAX_RECENT);
      return deduped;
    });
  };

  return (
    <AppContext.Provider value={{
      selectedChannel, setChannel,
      recentChannels,
      generatedContent, setGeneratedContent,
      isGenerating, setIsGenerating,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
