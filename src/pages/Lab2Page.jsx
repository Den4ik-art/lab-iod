import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Unlock, Check, X, ShieldAlert, RefreshCw,
  ChevronDown, ChevronUp, Clock, Download, Users,
  ArrowRight, Filter, Layers, ListChecks,
} from 'lucide-react';
import { LEGO_SERIES, ADMIN_SECRET } from '../data/legoSeries';
import { HEURISTICS, aggregateHeuristicPopularity } from '../data/heuristics';
import {
  aggregateResults, subscribeToAllVotes,
  subscribeToHeuristicRankings, subscribeToActionHistory, logAction,
} from '../services/storage';

// ── Lock screen (identical style to AdminPage) ────────────────────────
function LockScreen({ onUnlock }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (key === ADMIN_SECRET) onUnlock();
    else setError('Invalid secret key. Access denied.');
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 dot-bg"
      style={{ background: 'var(--bg-primary)' }}>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(10,132,255,0.07) 0%, transparent 70%)' }} />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="card max-w-sm w-full p-8"
        style={{ border: '1px solid var(--border-medium)' }}
      >
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(10,132,255,0.1)', border: '1px solid rgba(10,132,255,0.2)' }}>
            <Lock size={24} style={{ color: 'rgba(10,132,255,0.9)' }} />
          </div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Lab #2 Panel</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Heuristic Optimization System
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="input-field" type="password" placeholder="Admin secret key..."
            value={key} onChange={e => { setKey(e.target.value); setError(''); }} autoFocus />
          {error && (
            <div className="flex items-center gap-2 text-sm p-3 rounded-xl"
              style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.25)', color: '#FF3B30' }}>
              <ShieldAlert size={14} /> {error}
            </div>
          )}
          <button type="submit" className="btn-accent w-full justify-center"
            style={{ padding: '0.85rem', borderRadius: '12px', background: 'rgba(10,132,255,0.9)', color: '#fff' }}>
            <Unlock size={15} /> Unlock Lab #2
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ── Popularity table (left column) ───────────────────────────────────
function PopularityTable({ rankings }) {
  const { weights, counts } = aggregateHeuristicPopularity(rankings);
  const maxWeight = Math.max(...Object.values(weights), 1);

  const sorted = [...HEURISTICS].sort((a, b) => (weights[b.id] ?? 0) - (weights[a.id] ?? 0));

  return (
    <div className="space-y-2">
      {sorted.map((h) => {
        const w = weights[h.id] ?? 0;
        const c = counts[h.id] ?? 0;
        const pct = (w / maxWeight) * 100;
        return (
          <div key={h.id} className="rounded-xl px-3 py-2.5 transition-all"
            style={{ background: h.color, border: `1px solid ${h.borderColor}` }}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-widest"
                  style={{ color: 'var(--text-primary)' }}>{h.id}</span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{h.description}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {c > 0 && (
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                    style={{ background: 'rgba(255,215,0,0.15)', color: 'var(--accent)' }}>
                    #{1} ×{c}
                  </span>
                )}
                <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                  {w} pts
                </span>
              </div>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-light)' }}>
              <motion.div className="h-full rounded-full" animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ background: h.borderColor }} />
            </div>
          </div>
        );
      })}
      {rankings.length === 0 && (
        <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>
          No expert rankings submitted yet.
        </p>
      )}
      <p className="text-xs text-right mt-2" style={{ color: 'var(--text-muted)' }}>
        {rankings.length} of 21 experts submitted
      </p>
    </div>
  );
}

// ── Heuristic toggle row (center column) ─────────────────────────────
function HeuristicRow({ heuristic, active, removedCount, onApply, onRevert, disabled }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
      style={{
        background: active ? heuristic.color : 'var(--bg-secondary)',
        border: `1px solid ${active ? heuristic.borderColor : 'var(--border-light)'}`,
        opacity: disabled && !active ? 0.45 : 1,
      }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-xs"
        style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }}>
        {heuristic.id}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
          {heuristic.description}
        </p>
        {active && (
          <p className="text-xs mt-0.5" style={{ color: heuristic.borderColor }}>
            Removes {removedCount} series
          </p>
        )}
      </div>
      {active ? (
        <button
          onClick={onRevert}
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
          style={{ background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.35)', color: '#FF3B30' }}
          title="Revert heuristic"
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      ) : (
        <button
          onClick={onApply}
          disabled={disabled}
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
          style={{
            background: disabled ? 'transparent' : 'rgba(48,209,88,0.15)',
            border: disabled ? '1px solid var(--border-light)' : '1px solid rgba(48,209,88,0.35)',
            color: disabled ? 'var(--text-muted)' : '#30D158',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          title="Apply heuristic"
        >
          <Check size={13} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

// ── Step log ─────────────────────────────────────────────────────────
function StepLog({ steps }) {
  return (
    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
      <AnimatePresence initial={false}>
        {steps.length === 0 && (
          <p className="text-xs py-3 text-center" style={{ color: 'var(--text-muted)' }}>
            No heuristics applied yet.
          </p>
        )}
        {steps.map((s, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            className="text-xs font-mono px-3 py-1.5 rounded-lg"
            style={{ background: s.type === 'apply' ? 'rgba(48,209,88,0.08)' : 'rgba(255,59,48,0.08)', color: 'var(--text-secondary)', border: `1px solid ${s.type === 'apply' ? 'rgba(48,209,88,0.2)' : 'rgba(255,59,48,0.2)'}` }}>
            <span className="font-bold" style={{ color: s.type === 'apply' ? '#30D158' : '#FF3B30' }}>
              Step {i + 1}:
            </span>{' '}
            {s.type === 'apply' ? 'Applied' : 'Reverted'} {s.hId}
            {s.type === 'apply' && ` — ${s.before} → ${s.after} series`}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Action history drawer ─────────────────────────────────────────────
function ActionHistory({ actions }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-medium)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3 transition-all"
        style={{ background: 'var(--bg-card)', border: 'none', cursor: 'pointer' }}
      >
        <div className="flex items-center gap-2">
          <Clock size={14} style={{ color: 'var(--accent)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            Action History
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold ml-1"
            style={{ background: 'rgba(255,215,0,0.1)', color: 'var(--accent)' }}>
            {actions.length} entries
          </span>
        </div>
        {open
          ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} />
          : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="max-h-56 overflow-y-auto"
              style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)' }}>
              {actions.length === 0 ? (
                <p className="text-xs text-center py-5" style={{ color: 'var(--text-muted)' }}>
                  No actions recorded yet.
                </p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      {['Expert', 'Action', 'Heuristic', 'Before', 'After', 'Time'].map(h => (
                        <th key={h} className="text-left px-4 py-2" style={{ color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.65rem' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {actions.map((a) => (
                      <tr key={a.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td className="px-4 py-2 font-mono" style={{ color: 'var(--text-secondary)' }}>
                          {a.voterHash ? `${a.voterHash.slice(0, 6)}…` : 'admin'}
                        </td>
                        <td className="px-4 py-2 font-bold"
                          style={{ color: a.action === 'apply' ? '#30D158' : '#FF3B30' }}>
                          {a.action === 'apply' ? 'Apply' : 'Revert'}
                        </td>
                        <td className="px-4 py-2 font-black" style={{ color: 'var(--text-primary)' }}>{a.heuristicId}</td>
                        <td className="px-4 py-2" style={{ color: 'var(--text-muted)' }}>{a.before ?? '—'}</td>
                        <td className="px-4 py-2" style={{ color: 'var(--text-muted)' }}>{a.after ?? '—'}</td>
                        <td className="px-4 py-2" style={{ color: 'var(--text-muted)' }}>
                          {a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Lab2Page ─────────────────────────────────────────────────────
export default function Lab2Page() {
  const [unlocked, setUnlocked] = useState(false);
  const [scores, setScores] = useState({});
  const [rankings, setRankings] = useState([]);
  const [actions, setActions] = useState([]);
  const [activeHeuristics, setActiveHeuristics] = useState([]);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!unlocked) return;
    setLoading(true);

    const unsub1 = subscribeToAllVotes((votes) => {
      const { scores: s } = aggregateResults(votes);
      setScores(s);
      setLoading(false);
    });
    const unsub2 = subscribeToHeuristicRankings(setRankings);
    const unsub3 = subscribeToActionHistory(setActions);
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [unlocked]);

  // ── Compute ordered heuristics by expert popularity ─────────────────
  const { weights } = aggregateHeuristicPopularity(rankings);
  const orderedHeuristics = [...HEURISTICS].sort((a, b) => (weights[b.id] ?? 0) - (weights[a.id] ?? 0));

  // ── Compute which series are removed by each active heuristic ────────
  // We apply heuristics in order (already activated). A series is removed
  // if it matches ANY active heuristic from the original full list.
  const allSeriesIds = LEGO_SERIES.map(s => s.id);

  // Build per-heuristic: which of the CURRENT remaining series does it remove?
  function computeRemovedByHeuristic(hId, currentPool, sc) {
    const heuristic = HEURISTICS.find(h => h.id === hId);
    const filteredScores = {};
    currentPool.forEach(id => { if (sc[id]) filteredScores[id] = sc[id]; });
    return heuristic.filter(filteredScores);
  }

  // Build the cumulative filtered list step-by-step based on activeHeuristics order
  let remainingPool = allSeriesIds;
  const removedByHeuristic = {}; // hId → [seriesId, ...]
  // Process in the order they were activated (steps order)
  const activationOrder = steps.filter(s => s.type === 'apply').map(s => s.hId);
  activationOrder.forEach(hId => {
    if (!activeHeuristics.includes(hId)) return; // was reverted
    const toRemove = computeRemovedByHeuristic(hId, remainingPool, scores);
    removedByHeuristic[hId] = toRemove;
    remainingPool = remainingPool.filter(id => !toRemove.includes(id));
  });

  // Final core list
  const finalCoreIds = remainingPool;
  const finalCore = finalCoreIds
    .map(id => {
      const s = LEGO_SERIES.find(x => x.id === id);
      const sc = scores[id];
      return s ? { ...s, ...(sc ?? { total: 0, rank1: 0, rank2: 0, rank3: 0 }) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.total - a.total);

  // For each series: which heuristic currently highlights it (the first one)
  const seriesHighlight = {};
  activationOrder.forEach(hId => {
    if (!activeHeuristics.includes(hId)) return;
    (removedByHeuristic[hId] ?? []).forEach(id => {
      if (!seriesHighlight[id]) seriesHighlight[id] = hId;
    });
  });

  // ── Apply / Revert handlers ──────────────────────────────────────────
  const handleApply = async (hId) => {
    const before = finalCoreIds.length;
    // Simulate applying this heuristic to get after count
    const h = HEURISTICS.find(x => x.id === hId);
    const filteredScores = {};
    finalCoreIds.forEach(id => { if (scores[id]) filteredScores[id] = scores[id]; });
    const toRemove = h.filter(filteredScores);
    const after = finalCoreIds.length - new Set([...toRemove]).size;

    setActiveHeuristics(prev => [...prev, hId]);
    setSteps(prev => [...prev, { type: 'apply', hId, before, after }]);
    await logAction({ action: 'apply', heuristicId: hId, before, after, voterHash: 'admin' });
  };

  const handleRevert = async (hId) => {
    // Find the relevant step
    const step = steps.filter(s => s.type === 'apply' && s.hId === hId).at(-1);
    setActiveHeuristics(prev => prev.filter(id => id !== hId));
    setSteps(prev => [...prev, { type: 'revert', hId }]);
    await logAction({ action: 'revert', heuristicId: hId, before: step?.after, after: step?.before, voterHash: 'admin' });
  };

  // CSV export of final core
  const handleExport = () => {
    const rows = [
      ['Rank', 'Series', 'Total Points', '1st', '2nd', '3rd'],
      ...finalCore.map((s, i) => [i + 1, s.name, s.total ?? 0, s.rank1 ?? 0, s.rank2 ?? 0, s.rank3 ?? 0]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab2_final_core_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!unlocked) return <LockScreen onUnlock={() => setUnlocked(true)} />;

  const targetReached = finalCoreIds.length <= 10;

  return (
    <div className="min-h-screen pb-12" style={{ background: 'var(--bg-primary)' }}>
      {/* ── Header ── */}
      <div className="glass-panel sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(10,132,255,0.9)' }} />
              <p className="label" style={{ color: 'rgba(10,132,255,0.85)' }}>Lab #2 — Heuristic Optimization</p>
            </div>
            <h1 className="text-lg font-black mt-0.5" style={{ color: 'var(--text-primary)' }}>
              Final Core Selection
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {loading && (
              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'rgba(10,132,255,0.8)' }}>
                <RefreshCw size={12} className="animate-spin" /> Syncing...
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold"
              style={{
                background: targetReached ? 'rgba(48,209,88,0.12)' : 'rgba(255,215,0,0.1)',
                border: `1px solid ${targetReached ? 'rgba(48,209,88,0.35)' : 'rgba(255,215,0,0.3)'}`,
                color: targetReached ? '#30D158' : 'var(--accent)',
              }}>
              <Layers size={13} />
              n = {finalCoreIds.length}
              {targetReached && ' ✓ Target reached'}
            </div>
            <button className="btn-secondary" style={{ padding: '0.5rem 0.9rem' }} onClick={handleExport}>
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* ── 3-column layout ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr 1fr', gap: '1.25rem', alignItems: 'start' }}>

        {/* ══════ LEFT — Heuristic Popularity ══════ */}
        <div className="space-y-4">
          <div className="card p-4" style={{ border: '1px solid var(--border-medium)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Users size={14} style={{ color: 'rgba(10,132,255,0.8)' }} />
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Expert Popularity</h2>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Weighted score: position 1 = 7 pts, position 7 = 1 pt. Aggregated from {rankings.length} expert submissions.
            </p>
            <PopularityTable rankings={rankings} />
          </div>

          {/* Expert rankings summary */}
          <div className="card p-4" style={{ border: '1px solid var(--border-medium)' }}>
            <div className="flex items-center gap-2 mb-3">
              <ListChecks size={14} style={{ color: 'var(--accent)' }} />
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Survey Status</h2>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-light)' }}>
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${(rankings.length / 21) * 100}%`, background: 'var(--accent)' }} />
              </div>
              <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{rankings.length}/21</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {21 - rankings.length} expert(s) yet to submit
            </p>
            <a href="/heuristic-rank" target="_blank" rel="noopener"
              className="flex items-center gap-1.5 mt-3 text-xs font-semibold transition-all"
              style={{ color: 'rgba(10,132,255,0.8)', textDecoration: 'none' }}>
              Open Expert Survey <ArrowRight size={11} />
            </a>
          </div>
        </div>

        {/* ══════ CENTER — Controls + Data Table ══════ */}
        <div className="space-y-4">
          {/* Heuristic toggles */}
          <div className="card p-4" style={{ border: '1px solid var(--border-medium)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Filter size={14} style={{ color: '#30D158' }} />
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Heuristic Controls</h2>
              <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
                Sorted by expert priority
              </span>
            </div>
            <div className="space-y-2">
              {orderedHeuristics.map(h => {
                const isActive = activeHeuristics.includes(h.id);
                const filteredScores = {};
                finalCoreIds.forEach(id => { if (scores[id]) filteredScores[id] = scores[id]; });
                const wouldRemove = isActive
                  ? (removedByHeuristic[h.id] ?? []).length
                  : h.filter(filteredScores).length;
                // Disable apply if target already reached
                const disableApply = !isActive && targetReached;
                return (
                  <HeuristicRow
                    key={h.id}
                    heuristic={h}
                    active={isActive}
                    removedCount={wouldRemove}
                    onApply={() => handleApply(h.id)}
                    onRevert={() => handleRevert(h.id)}
                    disabled={disableApply}
                  />
                );
              })}
            </div>
          </div>

          {/* Step log */}
          <div className="card p-4" style={{ border: '1px solid var(--border-medium)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={13} style={{ color: 'var(--accent)' }} />
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Step-by-Step Log</h2>
            </div>
            <StepLog steps={steps} />
          </div>

          {/* Main data table */}
          <div className="card overflow-hidden" style={{ border: '1px solid var(--border-medium)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Series Data Table
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Color = heuristic targeting that series
              </p>
            </div>
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="protocol-table" style={{ fontSize: '0.78rem' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                  <tr>
                    <th style={{ width: 28 }}>#</th>
                    <th>Series</th>
                    <th>Pts</th>
                    <th>1st</th>
                    <th>2nd</th>
                    <th>3rd</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {LEGO_SERIES.map((series, idx) => {
                    const sc = scores[series.id];
                    const isRemoved = !finalCoreIds.includes(series.id);
                    const highlightHId = seriesHighlight[series.id];
                    const highlightH = highlightHId ? HEURISTICS.find(h => h.id === highlightHId) : null;

                    return (
                      <motion.tr
                        key={series.id}
                        layout
                        style={{
                          background: isRemoved
                            ? (highlightH?.color ?? 'rgba(255,59,48,0.07)')
                            : 'transparent',
                          opacity: isRemoved ? 0.55 : 1,
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <td>{idx + 1}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded flex-shrink-0"
                              style={{ background: series.color }} />
                            <span style={{ color: isRemoved ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                              {series.name}
                            </span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                          {sc?.total ?? 0}
                        </td>
                        <td style={{ color: 'var(--accent)', fontWeight: 700 }}>{sc?.rank1 ?? 0}</td>
                        <td style={{ color: '#9E9E9E', fontWeight: 600 }}>{sc?.rank2 ?? 0}</td>
                        <td style={{ color: '#CD7F32', fontWeight: 600 }}>{sc?.rank3 ?? 0}</td>
                        <td>
                          {isRemoved ? (
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                              style={{ background: highlightH?.color ?? 'rgba(255,59,48,0.12)', color: highlightH?.borderColor ?? '#FF3B30', border: `1px solid ${highlightH?.borderColor ?? 'rgba(255,59,48,0.35)'}` }}>
                              {highlightHId ?? 'removed'}
                            </span>
                          ) : (
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                              style={{ background: 'rgba(48,209,88,0.1)', color: '#30D158', border: '1px solid rgba(48,209,88,0.25)' }}>
                              in
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ══════ RIGHT — Final Core ══════ */}
        <div className="space-y-4">
          <div className="card p-4 sticky top-20" style={{ border: '1px solid var(--border-medium)' }}>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Final Core</h2>
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ml-auto`}
                style={{
                  background: targetReached ? 'rgba(48,209,88,0.12)' : 'rgba(255,215,0,0.12)',
                  color: targetReached ? '#30D158' : 'var(--accent)',
                  border: `1px solid ${targetReached ? 'rgba(48,209,88,0.3)' : 'rgba(255,215,0,0.3)'}`,
                }}>
                n = {finalCore.length}
              </span>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              {targetReached
                ? 'Target achieved — ≤ 10 series remaining'
                : `Need to remove ${finalCore.length - 10} more to reach ≤ 10`}
            </p>

            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {finalCore.map((s, idx) => (
                  <motion.div
                    key={s.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                    style={{
                      background: idx === 0 ? 'rgba(255,215,0,0.08)' : 'var(--bg-secondary)',
                      border: `1px solid ${idx === 0 ? 'rgba(255,215,0,0.3)' : 'var(--border-light)'}`,
                    }}
                  >
                    <span className="w-5 h-5 rounded text-xs font-black flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--border-light)', color: 'var(--text-muted)' }}>
                      {idx + 1}
                    </span>
                    <div className="w-5 h-5 rounded flex-shrink-0" style={{ background: s.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
                        {s.name}
                      </p>
                    </div>
                    <span className="text-xs font-black flex-shrink-0"
                      style={{ color: idx === 0 ? 'var(--accent)' : 'var(--text-muted)' }}>
                      {s.total} pts
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>

              {finalCore.length === 0 && (
                <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>
                  All series have been eliminated.
                </p>
              )}
            </div>

            {/* Target indicator bar */}
            <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span style={{ color: 'var(--text-muted)' }}>Reduction progress</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {LEGO_SERIES.length - finalCore.length}/{LEGO_SERIES.length - 10} removed
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-light)' }}>
                <motion.div className="h-full rounded-full" animate={{
                  width: `${Math.min(((LEGO_SERIES.length - finalCore.length) / Math.max(LEGO_SERIES.length - 10, 1)) * 100, 100)}%`
                }} transition={{ duration: 0.5 }}
                  style={{ background: targetReached ? '#30D158' : 'var(--accent)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Action History (full width bottom) ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <ActionHistory actions={actions} />
      </div>
    </div>
  );
}
