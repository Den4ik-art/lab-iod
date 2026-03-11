import { createContext, useContext, useState } from 'react';

const VoteContext = createContext(null);

export function VoteProvider({ children }) {
    const [voterHash, setVoterHash] = useState(null);
    const [voterId, setVoterId] = useState('');
    const [selectedItems, setSelectedItems] = useState([]); // [seriesId, ...]
    const [rankings, setRankings] = useState([]);           // [{ seriesId, rank }, ...]
    const [step, setStep] = useState('login');              // login | vote | rank | confirm | done
    const [hasAlreadyVoted, setHasAlreadyVoted] = useState(false);

    const toggleSelect = (seriesId) => {
        setSelectedItems(prev => {
            if (prev.includes(seriesId)) {
                // Deselect: also remove from rankings
                setRankings(r => r.filter(x => x.seriesId !== seriesId));
                return prev.filter(id => id !== seriesId);
            }
            if (prev.length >= 3) return prev;
            return [...prev, seriesId];
        });
    };

    const setRank = (seriesId, rank) => {
        setRankings(prev => {
            // Remove any existing entry for this series or this rank slot
            const filtered = prev.filter(x => x.seriesId !== seriesId && x.rank !== rank);
            return [...filtered, { seriesId, rank }];
        });
    };

    const reset = () => {
        setVoterHash(null);
        setVoterId('');
        setSelectedItems([]);
        setRankings([]);
        setStep('login');
        setHasAlreadyVoted(false);
    };

    return (
        <VoteContext.Provider value={{
            voterHash, setVoterHash,
            voterId, setVoterId,
            selectedItems, setSelectedItems,
            rankings, setRankings,
            step, setStep,
            hasAlreadyVoted, setHasAlreadyVoted,
            toggleSelect, setRank, reset,
        }}>
            {children}
        </VoteContext.Provider>
    );
}

export function useVote() {
    const ctx = useContext(VoteContext);
    if (!ctx) throw new Error('useVote must be used within VoteProvider');
    return ctx;
}
