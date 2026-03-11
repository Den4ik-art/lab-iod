import { AnimatePresence, motion } from 'framer-motion';
import { useVote, VoteProvider } from './context/VoteContext';
import { BrowserRouter, Route, Routes, Link, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import VotingPage from './pages/VotingPage';
import RankingPage from './pages/RankingPage';
import ConfirmPage from './pages/ConfirmPage';
import DonePage from './pages/DonePage';
import AdminPage from './pages/AdminPage';

// Step map
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

function AdminRoute() {
  return (
    <div>
      <div
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-3"
        style={{
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-light)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Link to="/" className="flex items-center gap-2 no-underline"
          style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
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
        <span className="label">Admin Mode</span>
      </div>
      <AdminPage />
    </div>
  );
}

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
