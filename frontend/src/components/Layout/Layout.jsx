import { NavLink } from 'react-router-dom';
import { Youtube, Lightbulb, History, Settings, Zap, Tv } from 'lucide-react';

const navItems = [
  { to: '/', icon: Zap, label: 'Generator' },
  { to: '/channels', icon: Tv, label: 'Channels' },
  { to: '/ideas', icon: Lightbulb, label: 'Ideas' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-yt-border bg-yt-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Youtube className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">YT Content Helper</span>
            <span className="badge bg-red-600/20 text-red-400 ml-1">Groq AI</span>
          </div>
          <nav className="flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `tab flex items-center gap-1.5 ${isActive ? 'tab-active' : 'tab-inactive'}`
                }
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      <footer className="border-t border-yt-border py-3 text-center text-xs text-gray-600">
        YouTube Content Helper · Powered by Groq AI & Llama 3.3
      </footer>
    </div>
  );
}
