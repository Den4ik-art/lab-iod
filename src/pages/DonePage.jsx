import { motion } from 'framer-motion';
import { CheckCircle2, Home, AlertCircle } from 'lucide-react';
import { useVote } from '../context/VoteContext';

export default function DonePage() {
    const { hasAlreadyVoted, reset, voterId } = useVote();

    return (
        <div className="min-h-screen flex items-center justify-center px-4 dot-bg"
            style={{ background: 'var(--bg-primary)' }}>
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-64 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.1) 0%, transparent 70%)' }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative card max-w-md w-full p-10 text-center"
                style={{ border: hasAlreadyVoted ? '1px solid var(--border-medium)' : '1.5px solid rgba(255,215,0,0.3)' }}
            >
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 280, damping: 16 }}
                    className="mx-auto mb-6 w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{
                        background: hasAlreadyVoted ? 'var(--bg-secondary)' : 'var(--accent)',
                        boxShadow: hasAlreadyVoted ? 'none' : '0 0 48px rgba(255,215,0,0.4)',
                    }}
                >
                    {hasAlreadyVoted
                        ? <AlertCircle size={34} style={{ color: 'var(--text-muted)' }} />
                        : <CheckCircle2 size={34} style={{ color: '#000' }} />
                    }
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-black mb-2"
                    style={{ color: hasAlreadyVoted ? 'var(--text-primary)' : 'var(--accent)' }}
                >
                    {hasAlreadyVoted ? 'Already Voted' : 'Vote Submitted!'}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="text-sm mb-8"
                    style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}
                >
                    {hasAlreadyVoted
                        ? `The ID "${voterId}" has already cast a vote. Each participant may only vote once.`
                        : `Thank you, ${voterId}! Your ballot has been anonymously recorded. Results are visible to the lab administrator.`
                    }
                </motion.p>

                {/* Vote receipt */}
                {!hasAlreadyVoted && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-4 rounded-2xl mb-6 text-left"
                        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}
                    >
                        <p className="label mb-3">Vote Receipt</p>
                        <div className="space-y-2">
                            {[
                                { label: 'Date', value: new Date().toISOString().split('T')[0] },
                                { label: 'Selections', value: '3 / 3' },
                                { label: 'Status', value: 'RECORDED', accent: true },
                            ].map(({ label, value, accent }) => (
                                <div key={label} className="flex justify-between text-xs">
                                    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                                    <span className="font-mono font-semibold"
                                        style={{ color: accent ? 'var(--green)' : 'var(--text-secondary)' }}>
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                <button className="btn-secondary w-full justify-center" onClick={reset}>
                    <Home size={15} /> Back to Start
                </button>
            </motion.div>
        </div>
    );
}
