import { motion } from 'framer-motion';
import { Check, Plus } from 'lucide-react';
import { useVote } from '../context/VoteContext';

export default function LegoCard({ series, index }) {
    const { selectedItems, toggleSelect } = useVote();

    const isSelected = selectedItems.includes(series.id);
    const selectionOrder = selectedItems.indexOf(series.id) + 1;
    const canSelect = selectedItems.length < 3 || isSelected;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.02, ease: [0.22, 1, 0.36, 1] }}
            whileHover={canSelect ? { y: -4, scale: 1.01 } : {}}
            onClick={() => canSelect && toggleSelect(series.id)}
            className="relative overflow-hidden rounded-2xl cursor-pointer select-none transition-all duration-200 flex flex-col"
            style={{
                border: isSelected
                    ? '2px solid var(--accent)'
                    : '1.5px solid var(--border-light)',
                boxShadow: isSelected
                    ? '0 0 0 3px rgba(255,215,0,0.18), 0 8px 24px rgba(0,0,0,0.5)'
                    : '0 4px 16px rgba(0,0,0,0.3)',
                opacity: !canSelect ? 0.3 : 1,
                cursor: !canSelect ? 'not-allowed' : 'pointer',
                background: 'var(--bg-card)',
            }}
        >
            {/* ── Banner image (16:9-ish, landscape) ── */}
            <div
                className="w-full overflow-hidden relative"
                style={{ aspectRatio: '16/9', background: series.color }}
            >
                <img
                    src={series.imageURL}
                    alt={series.name}
                    className="w-full h-full object-cover transition-transform duration-500"
                    style={{ transform: isSelected ? 'scale(1.07)' : 'scale(1)' }}
                    onError={e => {
                        // Hide broken img — parent div shows brand color fallback
                        e.target.style.display = 'none';
                    }}
                />

                {/* Dark gradient overlay at bottom */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'linear-gradient(to top, rgba(12,12,12,0.85) 0%, rgba(12,12,12,0.1) 55%, transparent 100%)',
                    }}
                />

                {/* Series color top strip */}
                <div
                    className="absolute top-0 left-0 right-0 h-0.5"
                    style={{ background: series.color }}
                />

                {/* Selected check badge (top-right) */}
                {isSelected && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--accent)', boxShadow: '0 2px 8px rgba(255,215,0,0.4)' }}
                    >
                        <Check size={12} color="#000" strokeWidth={3} />
                    </motion.div>
                )}
            </div>

            {/* ── Card footer ── */}
            <div className="flex items-center justify-between px-3 py-2.5">
                <div className="min-w-0">
                    <p className="font-bold text-sm leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
                        {series.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {series.year}
                    </p>
                </div>

                {/* Selection badge / add button */}
                {isSelected ? (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="badge-rank flex-shrink-0 ml-2"
                    >
                        {selectionOrder}
                    </motion.div>
                ) : (
                    <div
                        className="flex-shrink-0 ml-2 flex items-center justify-center"
                        style={{
                            width: 22, height: 22, borderRadius: '50%',
                            border: '1.5px dashed var(--border-medium)',
                            color: 'var(--text-muted)',
                        }}
                    >
                        <Plus size={11} />
                    </div>
                )}
            </div>
        </motion.div>
    );
}
