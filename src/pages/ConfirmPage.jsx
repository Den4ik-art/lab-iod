import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, CheckCircle2, Trophy, Medal, Star } from 'lucide-react';
import { LEGO_SERIES } from '../data/legoSeries';
import { useVote } from '../context/VoteContext';
import { saveVote } from '../services/storage';

const RANK_ICONS = [Trophy, Medal, Star];
const RANK_LABELS = ['1st Place', '2nd Place', '3rd Place'];

export default function ConfirmPage() {
    const { voterHash, voterId, setStep, setHasAlreadyVoted } = useVote();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const orderIds = JSON.parse(sessionStorage.getItem('lego_rank_order') || '[]');
    const rankedSeries = orderIds.map(id => LEGO_SERIES.find(s => s.id === id)).filter(Boolean);

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');
        try {
            const rankings = rankedSeries.map((s, idx) => ({ seriesId: s.id, rank: idx + 1 }));
            await saveVote({ voterHash, rankings, timestamp: new Date().toISOString() });
            setStep('done');
        } catch (err) {
            if (err.message === 'ALREADY_VOTED') {
                setHasAlreadyVoted(true);
                setStep('done');
                return;
            }
            console.error('Vote save failed:', err);
            setError('Failed to save your vote. Please check your connection and try again.');
            setSubmitting(false);
        }
    };

    if (rankedSeries.length === 0) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
            <div className="text-center">
                <p style={{ color: 'var(--text-muted)' }}>No ranking data. Please go back.</p>
                <button className="btn-secondary mt-4" onClick={() => setStep('vote')}>Go Back</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <div className="sticky top-0 z-30 glass-panel">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
                            <p className="label" style={{ color: 'var(--accent)' }}>Step 3 of 3 — Confirm Vote</p>
                        </div>
                        <h1 className="text-xl font-black mt-0.5" style={{ color: 'var(--text-primary)' }}>
                            Review your ballot
                        </h1>
                    </div>
                    <button className="btn-secondary" onClick={() => setStep('rank')}>
                        <ArrowLeft size={15} /> Edit
                    </button>
                </div>
                <div className="progress-bar rounded-none" style={{ borderRadius: 0 }}>
                    <div className="progress-fill accent" style={{ width: '100%' }} />
                </div>
            </div>

            <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
                {/* Voter identity card */}
                <div className="card p-4 mb-6 flex items-center gap-3"
                    style={{ border: '1px solid var(--border-medium)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black"
                        style={{ background: 'rgba(255,215,0,0.12)', color: 'var(--accent)', border: '1.5px solid rgba(255,215,0,0.3)' }}>
                        {voterId?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                            Voter: <span style={{ color: 'var(--accent)' }}>{voterId}</span>
                        </p>
                        <p className="text-xs font-mono truncate" style={{ color: 'var(--text-muted)' }}>
                            {voterHash?.slice(0, 20)}...
                        </p>
                    </div>
                    <CheckCircle2 size={18} style={{ color: 'var(--green)', flexShrink: 0 }} />
                </div>

                {/* Ranked items */}
                <div className="space-y-3">
                    {rankedSeries.map((series, idx) => {
                        const Icon = RANK_ICONS[idx];
                        return (
                            <motion.div key={series.id}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                className="card flex items-center gap-4 p-4 rounded-2xl"
                                style={{
                                    border: idx === 0 ? '1.5px solid rgba(255,215,0,0.4)' : '1px solid var(--border-light)',
                                    background: idx === 0 ? 'rgba(255,215,0,0.04)' : 'var(--bg-card)',
                                }}
                            >
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{
                                        background: idx === 0 ? 'var(--accent)' : 'var(--bg-secondary)',
                                        border: `1px solid ${idx === 0 ? 'var(--accent-dark)' : 'var(--border-medium)'}`,
                                    }}>
                                    <Icon size={20} style={{ color: idx === 0 ? '#000' : 'var(--text-muted)' }} />
                                </div>

                                <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden"
                                    style={{ border: '1px solid var(--border-light)', background: series.color }}>
                                    <img src={series.imageURL} alt={series.name} className="w-full h-full object-cover"
                                        onError={e => { e.target.style.display = 'none'; }} />
                                </div>

                                <div className="flex-1">
                                    <p className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{series.name}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{RANK_LABELS[idx]}</p>
                                </div>

                                <div className="text-2xl font-black"
                                    style={{ color: idx === 0 ? 'var(--accent)' : 'var(--text-muted)' }}>
                                    #{idx + 1}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Warning */}
                <div className="mt-6 p-4 rounded-2xl text-sm flex items-start gap-2"
                    style={{ background: 'var(--bg-card)', border: '1px dashed var(--border-medium)', color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <span>Your ballot is <strong style={{ color: 'var(--text-primary)' }}>final</strong> once submitted. You cannot change your vote after submission.</span>
                </div>

                {/* Submit */}
                <motion.button
                    className="btn-accent w-full justify-center mt-6"
                    style={{ padding: '1rem', fontSize: '1rem', borderRadius: '14px' }}
                    onClick={handleSubmit}
                    disabled={submitting}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    {submitting ? (
                        <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.25" />
                            <path d="M21 12a9 9 0 00-9-9" />
                        </svg>
                    ) : <Send size={18} />}
                    {submitting ? 'Submitting...' : 'Submit Vote'}
                </motion.button>

                {error && (
                    <div className="mt-3 p-3 rounded-xl text-sm flex items-center gap-2"
                        style={{ background: 'rgba(255,59,48,0.10)', border: '1px solid rgba(255,59,48,0.25)', color: '#FF3B30' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
