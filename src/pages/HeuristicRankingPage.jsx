import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Check, X, ShieldAlert, ArrowRight } from 'lucide-react';
import { HEURISTICS } from '../data/heuristics';
import { saveHeuristicRanking } from '../services/storage';
import { sha256 } from '../services/storage';

// Local ID input
function IdentifyStep({ onNext }) {
  const [name, setName] = useState('');
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) { setErr('Please enter your student ID or name.'); return; }
    const hash = await sha256(n.toLowerCase());
    onNext(hash, n);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 dot-bg"
      style={{ background: 'var(--bg-primary)' }}>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="card max-w-sm w-full p-8"
        style={{ border: '1px solid var(--border-medium)' }}
      >
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(10,132,255,0.1)', border: '1px solid rgba(10,132,255,0.25)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="rgba(10,132,255,0.9)" strokeWidth="1.5" className="w-6 h-6">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
            Lab #2 — Expert Survey
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Rank elimination heuristics by priority
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="input-field"
            type="text"
            placeholder="Your name or student ID..."
            value={name}
            onChange={e => { setName(e.target.value); setErr(''); }}
            autoFocus
          />
          {err && (
            <div className="flex items-center gap-2 text-sm p-3 rounded-xl"
              style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.25)', color: '#FF3B30' }}>
              <ShieldAlert size={14} /> {err}
            </div>
          )}
          <button type="submit" className="btn-accent w-full justify-center"
            style={{ padding: '0.85rem', borderRadius: '12px' }}>
            <ArrowRight size={15} /> Continue to Ranking
          </button>
        </form>
        <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
          University distributed data processing lab — expert session
        </p>
      </motion.div>
    </div>
  );
}

// Draggable heuristic list
function DragList({ items, setItems }) {
  const dragIdx = useRef(null);
  const dragOverIdx = useRef(null);

  const onDragStart = (idx) => { dragIdx.current = idx; };
  const onDragEnter = (idx) => { dragOverIdx.current = idx; };
  const onDragEnd = () => {
    const from = dragIdx.current;
    const to = dragOverIdx.current;
    if (from === null || to === null || from === to) { dragIdx.current = null; dragOverIdx.current = null; return; }
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    dragIdx.current = null;
    dragOverIdx.current = null;
  };

  return (
    <div className="space-y-2">
      {items.map((h, idx) => (
        <div
          key={h.id}
          draggable
          onDragStart={() => onDragStart(idx)}
          onDragEnter={() => onDragEnter(idx)}
          onDragEnd={onDragEnd}
          onDragOver={e => e.preventDefault()}
          className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-grab active:cursor-grabbing select-none transition-all"
          style={{
            background: h.color,
            border: `1px solid ${h.borderColor}`,
            userSelect: 'none',
          }}
        >
          {/* Priority badge */}
          <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }}>
            {idx + 1}
          </span>

          {/* Grip icon */}
          <GripVertical size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest" style={{ color: 'var(--text-muted)' }}>
                {h.id}
              </span>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {h.description}
              </span>
            </div>
          </div>

          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            {idx === 0 ? 'Highest priority' : idx === items.length - 1 ? 'Lowest priority' : ''}
          </span>
        </div>
      ))}
    </div>
  );
}

// Main page
export default function HeuristicRankingPage() {
  const [phase, setPhase] = useState('identify'); // identify | rank | done | error
  const [voterHash, setVoterHash] = useState('');
  const [voterName, setVoterName] = useState('');
  const [items, setItems] = useState([...HEURISTICS]);
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const handleIdentify = (hash, name) => {
    setVoterHash(hash);
    setVoterName(name);
    setPhase('rank');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrMsg('');
    try {
      await saveHeuristicRanking({
        voterHash,
        voterName,
        ranking: items.map(h => h.id),
        timestamp: new Date().toISOString(),
      });
      setPhase('done');
    } catch (err) {
      if (err.message === 'ALREADY_RANKED') {
        setErrMsg('You have already submitted a ranking. Only one submission is allowed per expert.');
      } else {
        setErrMsg('An error occurred. Please try again.');
        console.error(err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (phase === 'identify') return <IdentifyStep onNext={handleIdentify} />;

  if (phase === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 dot-bg"
        style={{ background: 'var(--bg-primary)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="card max-w-sm w-full p-8 text-center"
          style={{ border: '1px solid var(--border-medium)' }}
        >
          <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-5"
            style={{ background: 'rgba(48,209,88,0.12)', border: '1px solid rgba(48,209,88,0.35)' }}>
            <Check size={24} style={{ color: '#30D158' }} strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
            Ranking Submitted
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Thank you, <strong>{voterName}</strong>. Your heuristic priority ranking has been recorded.
          </p>
          <div className="mt-6 space-y-1.5">
            {items.map((h, idx) => (
              <div key={h.id} className="flex items-center gap-2 text-xs text-left px-3 py-1.5 rounded-lg"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                <span className="font-black w-4 text-center" style={{ color: 'var(--text-muted)' }}>{idx + 1}</span>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{h.id}</span>
                <span>{h.description}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="glass-panel sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <p className="label" style={{ color: 'rgba(10,132,255,0.8)' }}>Expert Survey — Lab #2</p>
            <h1 className="text-lg font-black mt-0.5" style={{ color: 'var(--text-primary)' }}>
              Heuristic Priority Ranking
            </h1>
          </div>
          <span className="text-xs px-3 py-1 rounded-full font-semibold"
            style={{ background: 'rgba(10,132,255,0.1)', border: '1px solid rgba(10,132,255,0.25)', color: 'rgba(10,132,255,0.9)' }}>
            {voterName}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Instructions */}
        <div className="card p-4 mb-6" style={{ border: '1px solid var(--border-medium)' }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Drag and reorder</span> the heuristics below — place the most important elimination criteria at the top (position&nbsp;1). This determines the order in which heuristics are applied to narrow down the LEGO series list to ≤ 10 items.
          </p>
        </div>

        {/* Priority badge legend */}
        <div className="flex items-center gap-4 mb-4 px-1">
          <span className="label">Highest priority</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, var(--accent), transparent)' }} />
          <span className="label">Lowest priority</span>
        </div>

        {/* Drag list */}
        <DragList items={items} setItems={setItems} />

        {/* Error */}
        <AnimatePresence>
          {errMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-sm p-3 rounded-xl mt-4"
              style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.25)', color: '#FF3B30' }}
            >
              <X size={14} /> {errMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            className="btn-accent w-full justify-center"
            style={{ padding: '0.9rem', borderRadius: '14px', fontSize: '0.925rem' }}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <Check size={16} strokeWidth={2.5} /> Submit Ranking
              </>
            )}
          </button>
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            One submission allowed per expert. Cannot be changed after submission.
          </p>
        </div>
      </div>
    </div>
  );
}
