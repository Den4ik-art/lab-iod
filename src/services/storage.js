import {
  collection, addDoc, getDocs, query,
  where, deleteDoc, onSnapshot, orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';

// Hashes a string using the native Web Crypto API
export async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Saves a vote document. Checks for duplicates before writing.
export async function saveVote(voteData) {
  const existing = await getDocs(
    query(collection(db, 'votes'), where('voterHash', '==', voteData.voterHash))
  );
  if (!existing.empty) throw new Error('ALREADY_VOTED');

  const docRef = await addDoc(collection(db, 'votes'), voteData);
  return docRef.id;
}

export async function getAllVotes() {
  const snap = await getDocs(query(collection(db, 'votes')));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export const getAllVotesWithDetails = getAllVotes;

// Returns an unsubscribe function. Calls callback whenever votes change.
export function subscribeToAllVotes(callback) {
  const q = query(collection(db, 'votes'));
  return onSnapshot(q,
    snap => callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))),
    err => console.error('Snapshot error:', err)
  );
}

// Resolves to true if this hash has already voted. Times out after 5 seconds.
export async function hasVoted(voterHash) {
  const timeout = new Promise(resolve => setTimeout(() => resolve(false), 5000));
  const check = getDocs(
    query(collection(db, 'votes'), where('voterHash', '==', voterHash))
  ).then(snap => !snap.empty).catch(() => false);
  return Promise.race([check, timeout]);
}

export async function clearAllData() {
  const snap = await getDocs(query(collection(db, 'votes')));
  await Promise.all(snap.docs.map(doc => deleteDoc(doc.ref)));
}

// Calculates total scores: 1st = 3 pts, 2nd = 2 pts, 3rd = 1 pt
export function aggregateResults(votes) {
  const scores = {};
  votes.forEach(vote => {
    if (!Array.isArray(vote.rankings)) return;
    vote.rankings.forEach(r => {
      if (!scores[r.seriesId]) scores[r.seriesId] = { total: 0, rank1: 0, rank2: 0, rank3: 0 };
      const pts = r.rank === 1 ? 3 : r.rank === 2 ? 2 : 1;
      scores[r.seriesId].total += pts;
      scores[r.seriesId][`rank${r.rank}`] += 1;
    });
  });
  return { totalVoters: votes.length, scores };
}

// Lab #2: Heuristic Rankings

export async function saveHeuristicRanking(data) {
  const existing = await getDocs(
    query(collection(db, 'heuristicRankings'), where('voterHash', '==', data.voterHash))
  );
  if (!existing.empty) throw new Error('ALREADY_RANKED');
  const docRef = await addDoc(collection(db, 'heuristicRankings'), data);
  return docRef.id;
}

export async function getAllHeuristicRankings() {
  const snap = await getDocs(query(collection(db, 'heuristicRankings')));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export function subscribeToHeuristicRankings(callback) {
  const q = query(collection(db, 'heuristicRankings'));
  return onSnapshot(q,
    snap => callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))),
    err => console.error('heuristicRankings snapshot error:', err)
  );
}

// Lab #2: Action History

export async function logAction(data) {
  await addDoc(collection(db, 'actionHistory'), {
    ...data,
    timestamp: new Date().toISOString(),
  });
}

export function subscribeToActionHistory(callback) {
  const q = query(collection(db, 'actionHistory'), orderBy('timestamp', 'desc'));
  return onSnapshot(q,
    snap => callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))),
    err => console.error('actionHistory snapshot error:', err)
  );
}
