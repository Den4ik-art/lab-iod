import { AnimatePresence, motion } from 'framer-motion';
import { useVote, VoteProvider } from './context/VoteContext';
import { BrowserRouter, Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import VotingPage from './pages/VotingPage';
import RankingPage from './pages/RankingPage';
import ConfirmPage from './pages/ConfirmPage';
import DonePage from './pages/DonePage';
import AdminPage from './pages/AdminPage';
import Lab2Page from './pages/Lab2Page';
import HeuristicRankingPage from './pages/HeuristicRankingPage';

// Voter flow
const STEP_PAGES = {
  login: <LoginPage />,
  vote: <VotingPage />,
  rank: <RankingPage />,
  confirm: <ConfirmPage />,
  done: <DonePage />,
};

function VoterFlow() {
  const { step } = useVote();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        style={{ minHeight: '100vh' }}
      >
        {STEP_PAGES[step] ?? <LoginPage />}
      </motion.div>
    </AnimatePresence>
  );
}

// Shared admin shell with Lab1 / Lab2 tabs
function AdminShell({ activeTab, children }) {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-3"
        style={{
          background: 'rgba(15,15,15,0.92)',
          borderBottom: '1px solid var(--border-light)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <Link to="/" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}
          className="flex items-center gap-2">
          <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
            <rect x="4" y="12" width="24" height="14" rx="2" fill="#FFD700" />
            <rect x="7" y="8" width="5" height="6" rx="1" fill="#FFD700" />
            <rect x="13.5" y="8" width="5" height="6" rx="1" fill="#FFD700" />
            <rect x="20" y="8" width="5" height="6" rx="1" fill="#FFD700" />
            <circle cx="10" cy="19" r="2" fill="black" />
            <circle cx="16" cy="19" r="2" fill="black" />
            <circle cx="22" cy="19" r="2" fill="black" />
          </svg>
          <span className="font-bold text-sm">LEGO Vote</span>
        </Link>

        {/* Lab tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
          <button
            onClick={() => navigate('/admin')}
            className="text-xs font-bold px-4 py-1.5 rounded-lg transition-all"
            style={{
              background: activeTab === 'lab1' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'lab1' ? '#000' : 'var(--text-muted)',
              border: 'none', cursor: 'pointer',
            }}>
            Lab 1
          </button>
          <button
            onClick={() => navigate('/lab2')}
            className="text-xs font-bold px-4 py-1.5 rounded-lg transition-all"
            style={{
              background: activeTab === 'lab2' ? 'rgba(10,132,255,0.9)' : 'transparent',
              color: activeTab === 'lab2' ? '#fff' : 'var(--text-muted)',
              border: 'none', cursor: 'pointer',
            }}>
            Lab 2
          </button>
        </div>

        <span className="label" style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>Admin Mode</span>
      </div>

      {/* Page content */}
      {children}
    </div>
  );
}

function AdminRoute() {
  return (
    <AdminShell activeTab="lab1">
      <AdminPage />
    </AdminShell>
  );
}

function Lab2Route() {
  return (
    <AdminShell activeTab="lab2">
      <Lab2Page />
    </AdminShell>
  );
}

// App router
function AppContent() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <VoteProvider>
            <VoterFlow />
          </VoteProvider>
        } />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="/lab2" element={<Lab2Route />} />
        <Route path="/heuristic-rank" element={<HeuristicRankingPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
