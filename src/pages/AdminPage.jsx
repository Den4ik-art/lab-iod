import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lock, Unlock, BarChart2, Users, Trophy, Medal, Star,
    Download, Trash2, RefreshCw, ShieldAlert, ChevronDown,
    ChevronUp, List, LayoutGrid, Clock
} from 'lucide-react';
import { LEGO_SERIES, ADMIN_SECRET } from '../data/legoSeries';
import { aggregateResults, clearAllData, subscribeToAllVotes, getAllVotesWithDetails } from '../services/storage';

function getMaxScore(scores) {
    return Math.max(...Object.values(scores).map(s => s.total), 1);
}

function getSeriesName(id) {
    return LEGO_SERIES.find(s => s.id === id)?.name ?? id;
}

const RANK_LABELS = { 1: '🥇 1st', 2: '🥈 2nd', 3: '🥉 3rd' };
// We'll use text labels instead of emoji in the db
const RANK_TEXT = { 1: '1st', 2: '2nd', 3: '3rd' };

// ─── Admin Lock Screen ────────────────────────────────────────────────
function LockScreen({ onUnlock }) {
    const [key, setKey] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (key === ADMIN_SECRET) { onUnlock(); }
        else { setError('Invalid secret key. Access denied.'); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 dot-bg"
            style={{ background: 'var(--bg-primary)' }}>
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-64 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.08) 0%, transparent 70%)' }} />

            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="card max-w-sm w-full p-8"
                style={{ border: '1px solid var(--border-medium)' }}
            >
                <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)' }}>
                        <Lock size={24} style={{ color: 'var(--accent)' }} />
                    </div>
                    <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Admin Panel</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Enter the administrator secret key
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        className="input-field"
                        type="password"
                        placeholder="Secret key..."
                        value={key}
                        onChange={e => { setKey(e.target.value); setError(''); }}
                        autoFocus
                    />
                    {error && (
                        <div className="flex items-center gap-2 text-sm p-3 rounded-xl"
                            style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.25)', color: '#FF3B30' }}>
                            <ShieldAlert size={14} /> {error}
                        </div>
                    )}
                    <button type="submit" className="btn-accent w-full justify-center"
                        style={{ padding: '0.85rem', borderRadius: '12px' }}>
                        <Unlock size={15} /> Unlock
                    </button>
                </form>
                <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
                    For university lab administrator use only
                </p>
            </motion.div>
        </div>
    );
}

// ─── Single vote row (expandable) ─────────────────────────────────────
function VoteRow({ vote, index }) {
    const [open, setOpen] = useState(false);
    const sorted = [...vote.rankings].sort((a, b) => a.rank - b.rank);

    return (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-light)', marginBottom: '0.5rem' }}>
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-left transition-all"
                style={{ background: 'var(--bg-card)', cursor: 'pointer', border: 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
            >
                <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ background: 'var(--border-light)', color: 'var(--text-secondary)' }}>
                        {index + 1}
                    </span>
                    <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {vote.voterHash.slice(0, 8)}...{vote.voterHash.slice(-6)}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {vote.timestamp ? new Date(vote.timestamp).toLocaleString() : 'Unknown time'}
                        </p>
                    </div>
                </div>

                {/* Compact summary of picks */}
                <div className="flex items-center gap-2 mr-3 hidden sm:flex">
                    {sorted.map(r => (
                        <span key={r.rank} className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: r.rank === 1 ? 'rgba(255,215,0,0.15)' : 'var(--border-light)', color: r.rank === 1 ? 'var(--accent)' : 'var(--text-secondary)' }}>
                            #{r.rank} {getSeriesName(r.seriesId)}
                        </span>
                    ))}
                </div>

                {open ? <ChevronUp size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    : <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div className="px-4 pb-4 pt-2 space-y-2"
                            style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)' }}>
                            <p className="label mb-2">Full ballot</p>
                            {sorted.map(r => {
                                const series = LEGO_SERIES.find(s => s.id === r.seriesId);
                                return (
                                    <div key={r.rank} className="flex items-center gap-3 p-2 rounded-lg"
                                        style={{ background: 'var(--bg-card)' }}>
                                        <span className="text-sm font-bold w-6 text-center"
                                            style={{ color: r.rank === 1 ? 'var(--accent)' : 'var(--text-muted)' }}>
                                            #{r.rank}
                                        </span>
                                        {series && (
                                            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"
                                                style={{ border: '1px solid var(--border-light)' }}>
                                                <img src={series.imageURL} alt={series.name} className="w-full h-full object-cover"
                                                    onError={e => { e.target.style.display = 'none'; e.target.parentNode.style.background = series.color; }} />
                                            </div>
                                        )}
                                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                            {getSeriesName(r.seriesId)}
                                        </span>
                                        <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
                                            {r.rank === 1 ? '3 pts' : r.rank === 2 ? '2 pts' : '1 pt'}
                                        </span>
                                    </div>
                                );
                            })}
                            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                                Hash: <span className="font-mono">{vote.voterHash}</span>
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Main Admin Page ───────────────────────────────────────────────────
export default function AdminPage() {
    const [unlocked, setUnlocked] = useState(false);
    const [data, setData] = useState(null);
    const [allVotes, setAllVotes] = useState([]);
    const [confirmClear, setConfirmClear] = useState(false);
    const [activeTab, setActiveTab] = useState('results'); // results | votes
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!unlocked) return;
        setIsLoading(true);

        // FAST PATH: getDocs fires one instant HTTP request and returns data immediately.
        // This shows results in < 2s on first load, before the long-polling cycle starts.
        getAllVotesWithDetails().then(initialVotes => {
            setData(aggregateResults(initialVotes));
            setAllVotes(initialVotes);
            setIsLoading(false);
        }).catch(() => { /* fall through to onSnapshot */ });

        // REAL-TIME PATH: keeps data live after the initial load.
        const unsubscribe = subscribeToAllVotes((votes) => {
            setData(aggregateResults(votes));
            setAllVotes(votes);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [unlocked]);

    const handleUnlock = () => { setUnlocked(true); };

    const handleClear = async () => {
        if (confirmClear) { await clearAllData(); setConfirmClear(false); }
        else { setConfirmClear(true); }
    };

    const sortedSeries = data
        ? Object.entries(data.scores)
            .sort(([, a], [, b]) => b.total - a.total)
            .map(([id, stats]) => ({ ...stats, series: LEGO_SERIES.find(s => s.id === id) }))
            .filter(i => i.series)
        : [];

    const maxScore = data ? getMaxScore(data.scores) : 1;

    const handleExportCSV = () => {
        const rows = [
            ['Rank', 'Series', 'Total Points', '1st Place Votes', '2nd Place Votes', '3rd Place Votes'],
            ...sortedSeries.map((item, idx) => [
                idx + 1, item.series.name, item.total, item.rank1, item.rank2, item.rank3,
            ]),
        ];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lego_votes_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!unlocked) return <LockScreen onUnlock={handleUnlock} />;

    return (
        <div className="min-h-screen pb-16" style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <div className="sticky top-0 z-30 glass-panel">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
                            <p className="label" style={{ color: 'var(--accent)' }}>Administrator View</p>
                        </div>
                        <h1 className="text-xl font-black mt-0.5" style={{ color: 'var(--text-primary)' }}>
                            Core of Leaders
                        </h1>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {isLoading && (
                            <div className="flex items-center gap-2 px-3 text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                                <RefreshCw size={14} className="animate-spin" /> Syncing...
                            </div>
                        )}
                        <button className="btn-secondary" onClick={handleExportCSV}><Download size={13} /> CSV</button>
                        <button className="btn-secondary"
                            style={confirmClear ? { borderColor: 'var(--red)', color: 'var(--red)' } : {}}
                            onClick={handleClear}>
                            <Trash2 size={13} /> {confirmClear ? 'Confirm?' : 'Clear'}
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1 pb-3">
                    {[
                        { key: 'results', label: 'Results', icon: LayoutGrid },
                        { key: 'votes', label: `Individual Votes (${allVotes.length})`, icon: List },
                    ].map(({ key, label, icon: Icon }) => (
                        <button key={key} onClick={() => setActiveTab(key)}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                            style={{
                                background: activeTab === key ? 'var(--accent)' : 'transparent',
                                color: activeTab === key ? '#000' : 'var(--text-muted)',
                                border: activeTab === key ? 'none' : '1px solid transparent',
                            }}>
                            <Icon size={13} /> {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* Skeleton loading state */}
                {isLoading && (
                    <div className="space-y-4 animate-pulse">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="card p-5 h-24" style={{ background: 'var(--bg-card)' }}>
                                    <div className="h-3 w-24 rounded-full mb-3" style={{ background: 'var(--border-medium)' }} />
                                    <div className="h-8 w-16 rounded-lg" style={{ background: 'var(--border-light)' }} />
                                </div>
                            ))}
                        </div>
                        <div className="card overflow-hidden" style={{ border: '1px solid var(--border-medium)' }}>
                            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <div className="h-4 w-40 rounded-full" style={{ background: 'var(--border-medium)' }} />
                            </div>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 px-6 py-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <div className="h-4 w-6 rounded" style={{ background: 'var(--border-light)' }} />
                                    <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: 'var(--border-medium)' }} />
                                    <div className="h-4 w-32 rounded-full" style={{ background: 'var(--border-medium)' }} />
                                    <div className="ml-auto h-4 w-16 rounded-full" style={{ background: 'var(--border-light)' }} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'results' && !isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                        {/* Stats row */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {[
                                { label: 'Total Voters', value: data?.totalVoters ?? 0, icon: Users },
                                { label: 'Series Ranked', value: sortedSeries.length, icon: BarChart2 },
                                { label: 'Top Series', value: sortedSeries[0]?.series?.name ?? '—', icon: Trophy, small: true },
                            ].map(({ label, value, icon: Icon, small }) => (
                                <div key={label} className="card p-5">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="label">{label}</p>
                                            <p className={`font-black mt-1 ${small ? 'text-lg' : 'text-3xl'}`}
                                                style={{ color: 'var(--text-primary)' }}>{value}</p>
                                        </div>
                                        <Icon size={18} style={{ color: 'var(--accent)', opacity: 0.7 }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Podium top 3 */}
                        {sortedSeries.length >= 3 && (
                            <div>
                                <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Top 3 Podium</h2>
                                <div className="grid grid-cols-3 gap-4 items-end">
                                    {[
                                        { idx: 1, label: '2nd', height: 'h-20', accented: false },
                                        { idx: 0, label: '1st', height: 'h-28', accented: true },
                                        { idx: 2, label: '3rd', height: 'h-14', accented: false },
                                    ].map(({ idx, label, height, accented }) => {
                                        const item = sortedSeries[idx];
                                        return (
                                            <motion.div key={idx}
                                                initial={{ opacity: 0, y: 24 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1, duration: 0.4 }}
                                                className="card flex flex-col items-center p-4 text-center"
                                                style={accented ? { border: '1.5px solid var(--accent)', boxShadow: 'var(--shadow-accent)' } : {}}>
                                                <div
                                                    className={`w-full rounded-xl overflow-hidden ${height} mb-3`}
                                                    style={{ background: accented ? 'rgba(255,215,0,0.08)' : 'var(--bg-secondary)' }}
                                                >
                                                    <img src={item.series.imageURL} alt={item.series.name}
                                                        className="w-full h-full object-cover"
                                                        onError={e => { e.target.style.display = 'none'; e.target.parentNode.style.background = item.series.color; }}
                                                    />
                                                </div>
                                                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{item.series.name}</p>
                                                <p className="text-xs mt-0.5" style={{ color: accented ? 'var(--accent)' : 'var(--text-muted)' }}>
                                                    {item.total} pts · {label}
                                                </p>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Protocol table */}
                        <div className="card overflow-hidden" style={{ border: '1px solid var(--border-medium)' }}>
                            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Complete Protocol Table</h2>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                    Scoring: 1st = 3 pts, 2nd = 2 pts, 3rd = 1 pt
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                {sortedSeries.length === 0 ? (
                                    <div className="p-12 text-center" style={{ color: 'var(--text-muted)' }}>
                                        <BarChart2 size={32} className="mx-auto mb-3 opacity-30" />
                                        <p className="text-sm">No votes recorded yet.</p>
                                    </div>
                                ) : (
                                    <table className="protocol-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Series</th>
                                                <th>Score</th>
                                                <th>Progress</th>
                                                <th>1st</th>
                                                <th>2nd</th>
                                                <th>3rd</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedSeries.map((item, idx) => (
                                                <motion.tr key={item.series.id}
                                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                    transition={{ delay: idx * 0.025 }}>
                                                    <td>
                                                        <span className={idx === 0 ? 'rank-gold' : idx === 1 ? 'rank-silver' : idx === 2 ? 'rank-bronze' : ''}>
                                                            {idx + 1}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"
                                                                style={{ border: '1px solid var(--border-light)', background: item.series.color }}>
                                                                <img src={item.series.imageURL} alt={item.series.name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={e => { e.target.style.display = 'none'; }} />
                                                            </div>
                                                            <span className="font-semibold text-sm">{item.series.name}</span>
                                                        </div>
                                                    </td>
                                                    <td><span className="font-black text-base" style={{ color: idx === 0 ? 'var(--accent)' : 'var(--text-primary)' }}>{item.total}</span></td>
                                                    <td style={{ minWidth: '100px' }}>
                                                        <div className="progress-bar">
                                                            <div className={`progress-fill ${idx === 0 ? 'gold' : ''}`}
                                                                style={{ width: `${(item.total / maxScore) * 100}%` }} />
                                                        </div>
                                                    </td>
                                                    <td className="rank-gold">{item.rank1}</td>
                                                    <td className="rank-silver">{item.rank2}</td>
                                                    <td className="rank-bronze">{item.rank3}</td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── Individual Votes tab ── */}
                {activeTab === 'votes' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex items-center gap-3 mb-5">
                            <Clock size={16} style={{ color: 'var(--accent)' }} />
                            <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                All Recorded Ballots
                            </h2>
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                style={{ background: 'rgba(255,215,0,0.1)', color: 'var(--accent)' }}>
                                {allVotes.length} total
                            </span>
                        </div>

                        {allVotes.length === 0 ? (
                            <div className="card p-16 text-center" style={{ border: '1px dashed var(--border-medium)' }}>
                                <Users size={32} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--accent)' }} />
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No votes have been cast yet.</p>
                            </div>
                        ) : (
                            <div>
                                {[...allVotes].reverse().map((vote, idx) => (
                                    <motion.div key={vote.voterHash + idx}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.035 }}>
                                        <VoteRow vote={vote} index={allVotes.length - 1 - idx} />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
