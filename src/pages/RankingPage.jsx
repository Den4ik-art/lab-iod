import { useState } from 'react';
import { motion } from 'framer-motion';
import { Reorder } from 'framer-motion';
import { ArrowRight, ArrowLeft, GripVertical, Trophy, Medal, Star } from 'lucide-react';
import { LEGO_SERIES } from '../data/legoSeries';
import { useVote } from '../context/VoteContext';

const RANK_CONFIG = [
    { rank: 1, label: '1st Place', icon: Trophy, pts: 3 },
    { rank: 2, label: '2nd Place', icon: Medal, pts: 2 },
    { rank: 3, label: '3rd Place', icon: Star, pts: 1 },
];

export default function RankingPage() {
    const { selectedItems, setStep } = useVote();
    const initialOrder = selectedItems.map(id => LEGO_SERIES.find(s => s.id === id)).filter(Boolean);
    const [order, setOrder] = useState(initialOrder);

    const handleProceed = () => {
        sessionStorage.setItem('lego_rank_order', JSON.stringify(order.map(s => s.id)));
        setStep('confirm');
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <div className="sticky top-0 z-30 glass-panel">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
                            <p className="label" style={{ color: 'var(--accent)' }}>Step 2 of 3 — Rank Your Choices</p>
                        </div>
                        <h1 className="text-xl font-black mt-0.5" style={{ color: 'var(--text-primary)' }}>
                            Drag to set priority
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn-secondary" onClick={() => setStep('vote')}>
                            <ArrowLeft size={15} /> Back
                        </button>
                        <button className="btn-accent" onClick={handleProceed}>
                            Review <ArrowRight size={15} />
                        </button>
                    </div>
                </div>
                <div className="progress-bar rounded-none" style={{ borderRadius: 0 }}>
                    <div className="progress-fill accent" style={{ width: '66.6%' }} />
                </div>
            </div>

            <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
                {/* Instruction */}
                <div className="flex items-center gap-3 p-4 rounded-2xl mb-6"
                    style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.15)' }}>
                    <GripVertical size={16} style={{ color: 'var(--accent)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Drag</strong> cards to reorder.
                        Top = highest priority (3 pts), Bottom = lowest (1 pt).
                    </p>
                </div>

                {/* Reorderable list */}
                <Reorder.Group axis="y" values={order} onReorder={setOrder} className="space-y-3">
                    {order.map((series, idx) => {
                        const cfg = RANK_CONFIG[idx];
                        const Icon = cfg.icon;
                        return (
                            <Reorder.Item
                                key={series.id}
                                value={series}
                                whileDrag={{ scale: 1.02, boxShadow: '0 16px 48px rgba(0,0,0,0.6)', zIndex: 50 }}
                            >
                                <div className="card flex items-center gap-4 p-4 rounded-2xl cursor-grab active:cursor-grabbing"
                                    style={{
                                        userSelect: 'none',
                                        border: idx === 0 ? '1.5px solid rgba(255,215,0,0.4)' : '1px solid var(--border-light)',
                                        background: idx === 0 ? 'rgba(255,215,0,0.05)' : 'var(--bg-card)',
                                    }}
                                >
                                    {/* Rank badge */}
                                    <div className="flex-shrink-0 w-11 h-11 rounded-xl flex flex-col items-center justify-center"
                                        style={{
                                            background: idx === 0 ? 'var(--accent)' : 'var(--bg-secondary)',
                                            border: `1px solid ${idx === 0 ? 'var(--accent-dark)' : 'var(--border-medium)'}`,
                                        }}
                                    >
                                        <Icon size={15} style={{ color: idx === 0 ? '#000' : 'var(--text-muted)' }} />
                                        <span style={{ fontSize: '0.6rem', fontWeight: 800, color: idx === 0 ? '#000' : 'var(--text-muted)', lineHeight: 1 }}>
                                            {cfg.pts}pt
                                        </span>
                                    </div>

                                    {/* Series image */}
                                    <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden"
                                        style={{ border: '1px solid var(--border-light)', background: series.color }}>
                                        <img src={series.imageURL} alt={series.name} className="w-full h-full object-cover"
                                            onError={e => { e.target.style.display = 'none'; }} />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{series.name}</p>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                            {cfg.label} &mdash; {cfg.pts} {cfg.pts === 1 ? 'point' : 'points'}
                                        </p>
                                    </div>

                                    <GripVertical size={18} style={{ color: 'var(--border-medium)', flexShrink: 0 }} />
                                </div>
                            </Reorder.Item>
                        );
                    })}
                </Reorder.Group>

                {/* Scoring legend */}
                <div className="mt-6 p-4 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
                    <p className="label mb-3">Scoring system</p>
                    <div className="flex gap-5 flex-wrap">
                        {RANK_CONFIG.map(cfg => {
                            const Icon = cfg.icon;
                            return (
                                <div key={cfg.rank} className="flex items-center gap-2">
                                    <Icon size={13} style={{ color: 'var(--accent)', opacity: 0.8 }} />
                                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                        {cfg.label}: <strong style={{ color: 'var(--text-primary)' }}>{cfg.pts} pts</strong>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
