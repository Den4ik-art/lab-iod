import { motion, AnimatePresence } from 'framer-motion';
import { LEGO_SERIES, MAX_SELECTIONS } from '../data/legoSeries';
import { useVote } from '../context/VoteContext';
import LegoCard from '../components/LegoCard';
import { ArrowRight, Info } from 'lucide-react';

export default function VotingPage() {
    const { selectedItems, setStep } = useVote();
    const canProceed = selectedItems.length === MAX_SELECTIONS;

    return (
        <div className="min-h-screen pb-32" style={{ background: 'var(--bg-primary)' }}>
            {/* Sticky top bar */}
            <div className="sticky top-0 z-30 glass-panel">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
                            <p className="label" style={{ color: 'var(--accent)' }}>Step 1 of 3 — Select Series</p>
                        </div>
                        <h1 className="text-xl font-black mt-0.5" style={{ color: 'var(--text-primary)' }}>
                            Choose your 3 favourites
                        </h1>
                    </div>

                    {/* Slot indicators + Next button */}
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                            {[1, 2, 3].map(n => (
                                <div key={n}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300"
                                    style={{
                                        background: selectedItems.length >= n ? 'var(--accent)' : 'var(--bg-card)',
                                        color: selectedItems.length >= n ? '#000' : 'var(--text-muted)',
                                        border: `1.5px ${selectedItems.length >= n ? 'solid var(--accent)' : 'dashed var(--border-medium)'}`,
                                        boxShadow: selectedItems.length >= n ? '0 0 12px rgba(255,215,0,0.3)' : 'none',
                                    }}
                                >
                                    {n}
                                </div>
                            ))}
                        </div>
                        <button
                            className="btn-accent"
                            disabled={!canProceed}
                            onClick={() => setStep('rank')}
                        >
                            Next <ArrowRight size={15} />
                        </button>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="progress-bar rounded-none" style={{ borderRadius: 0 }}>
                    <div className="progress-fill accent"
                        style={{ width: `${(selectedItems.length / MAX_SELECTIONS) * 33.3}%` }} />
                </div>
            </div>

            {/* Info banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <div className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm"
                    style={{
                        background: 'rgba(255,215,0,0.06)',
                        border: '1px solid rgba(255,215,0,0.15)',
                        color: 'var(--text-secondary)',
                    }}>
                    <Info size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    Select exactly <strong style={{ color: 'var(--accent)' }}>3 LEGO series</strong>. You&apos;ll rank them in the next step.
                </div>
            </div>

            {/* Cards grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {LEGO_SERIES.map((series, idx) => (
                        <LegoCard key={series.id} series={series} index={idx} />
                    ))}
                </div>
            </div>

            {/* Mobile floating CTA */}
            <AnimatePresence>
                {selectedItems.length > 0 && (
                    <motion.div
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="fixed bottom-0 left-0 right-0 z-40 sm:hidden px-4 pb-6 pt-3"
                        style={{
                            background: 'linear-gradient(to top, var(--bg-primary) 70%, transparent)',
                        }}
                    >
                        <button
                            className="btn-accent w-full justify-center"
                            style={{ padding: '1rem', borderRadius: '14px' }}
                            disabled={!canProceed}
                            onClick={() => setStep('rank')}
                        >
                            {canProceed ? 'Rank your choices' : `Select ${MAX_SELECTIONS - selectedItems.length} more`}
                            <ArrowRight size={15} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
