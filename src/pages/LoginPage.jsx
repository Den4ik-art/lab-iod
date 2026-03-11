import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, AlertCircle, Shield } from 'lucide-react';
import { sha256, hasVoted } from '../services/storage';
import { useVote } from '../context/VoteContext';

export default function LoginPage() {
    const { setVoterHash, setVoterId, setStep, setHasAlreadyVoted } = useVote();
    const [id, setId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedId = id.trim();
        if (!trimmedId) { setError('Please enter your Voter ID.'); return; }

        setLoading(true);
        setError('');

        const hash = await sha256(trimmedId.toLowerCase());
        setVoterHash(hash);
        setVoterId(trimmedId);

        setStep('vote');

        hasVoted(hash).then(voted => {
            if (voted) {
                setHasAlreadyVoted(true);
                setStep('done');
            }
        }).catch(() => { });
    };


    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 dot-bg"
            style={{ background: 'var(--bg-primary)' }}>

            {/* Top ambient glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-64 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.12) 0%, transparent 70%)',
                }} />

            <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 18 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5"
                        style={{ background: 'var(--accent)', boxShadow: '0 0 40px rgba(255,215,0,0.4)' }}
                    >
                        <svg viewBox="0 0 32 32" fill="none" className="w-10 h-10">
                            <rect x="3" y="12" width="26" height="15" rx="3" fill="black" />
                            <rect x="6" y="7" width="5" height="7" rx="1.5" fill="black" />
                            <rect x="13.5" y="7" width="5" height="7" rx="1.5" fill="black" />
                            <rect x="21" y="7" width="5" height="7" rx="1.5" fill="black" />
                            <circle cx="9.5" cy="19.5" r="2.5" fill="white" />
                            <circle cx="16" cy="19.5" r="2.5" fill="white" />
                            <circle cx="22.5" cy="19.5" r="2.5" fill="white" />
                        </svg>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-4xl font-black tracking-tight glow-text"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        LEGO<span style={{ color: 'var(--accent)' }}>Vote</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-2 text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        University Laboratory &mdash; Priority Voting System
                    </motion.p>
                </div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="card p-8"
                    style={{ border: '1px solid var(--border-medium)' }}
                >
                    <div className="mb-6">
                        <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                            Identify yourself
                        </h2>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Your ID will be hashed with SHA-256 to ensure anonymity.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="label block mb-2">Voter ID</label>
                            {/* Plain text input — no masking */}
                            <input
                                className="input-field"
                                type="text"
                                placeholder="Enter your student ID..."
                                value={id}
                                onChange={e => { setId(e.target.value); setError(''); }}
                                autoComplete="off"
                                autoFocus
                                style={{ fontWeight: id ? '600' : '400' }}
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="flex items-center gap-2 text-sm p-3 rounded-xl"
                                style={{ background: 'rgba(255,59,48,0.12)', border: '1px solid rgba(255,59,48,0.3)', color: '#FF3B30' }}
                            >
                                <AlertCircle size={14} /> {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            className="btn-accent w-full justify-center"
                            style={{ padding: '0.9rem', fontSize: '0.95rem', borderRadius: '12px' }}
                            disabled={loading || !id.trim()}
                        >
                            {loading ? (
                                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.25" />
                                    <path d="M21 12a9 9 0 00-9-9" />
                                </svg>
                            ) : <LogIn size={16} />}
                            {loading ? 'Verifying...' : 'Start Voting'}
                        </button>
                    </form>

                    <div className="divider my-6" />

                    <div className="flex items-start gap-3 p-3 rounded-xl"
                        style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.15)' }}>
                        <Shield size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                        <p className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            Your ID is <strong style={{ color: 'var(--text-primary)' }}>never stored in plain text</strong>.
                            A one-way SHA-256 hash ensures anonymity while preventing duplicate voting.
                        </p>
                    </div>
                </motion.div>

                {/* Admin link */}
                <div className="text-center mt-6 flex items-center justify-between px-1">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        LEGO Vote &copy; {new Date().getFullYear()} University Lab
                    </p>
                    <a href="/admin" className="text-xs"
                        style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                        onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                    >
                        Admin Panel →
                    </a>
                </div>
            </motion.div>
        </div>
    );
}
