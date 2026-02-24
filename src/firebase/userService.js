// Firestore user profile operations (XP, level, badges)
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from './config';

const USERS_COLLECTION = 'users';

// XP awarded per completed task
export const XP_PER_TASK = 10;

// Level thresholds and badge names
export const LEVELS = [
    { level: 1, minXP: 0, badge: 'Beginner', color: 'from-slate-400 to-slate-500' },
    { level: 2, minXP: 50, badge: 'Apprentice', color: 'from-green-400 to-emerald-500' },
    { level: 3, minXP: 150, badge: 'Achiever', color: 'from-blue-400 to-indigo-500' },
    { level: 4, minXP: 350, badge: 'Master', color: 'from-purple-400 to-violet-500' },
    { level: 5, minXP: 700, badge: 'Legend', color: 'from-amber-400 to-orange-500' },
];

/**
 * Calculate the current level info based on total XP.
 */
export function getLevelInfo(xp) {
    let current = LEVELS[0];
    for (const lvl of LEVELS) {
        if (xp >= lvl.minXP) current = lvl;
    }
    const nextLevel = LEVELS.find((l) => l.level === current.level + 1);
    const progress = nextLevel
        ? ((xp - current.minXP) / (nextLevel.minXP - current.minXP)) * 100
        : 100;
    return { ...current, xp, nextXP: nextLevel?.minXP ?? xp, progress: Math.min(progress, 100) };
}

/**
 * Get or create a user profile document in Firestore.
 */
export async function getUserProfile(userId) {
    const ref = doc(db, USERS_COLLECTION, userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
        const initial = { xp: 0, tasksCompleted: 0 };
        await setDoc(ref, initial);
        return initial;
    }
    return snap.data();
}

/**
 * Award XP to a user when they complete a task.
 * Also marks the task as xpAwarded to prevent double-awarding.
 */
export async function awardXP(userId) {
    const ref = doc(db, USERS_COLLECTION, userId);
    await updateDoc(ref, {
        xp: increment(XP_PER_TASK),
        tasksCompleted: increment(1),
    });
}

/**
 * Subscribe to a user's profile in real-time.
 */
import { onSnapshot } from 'firebase/firestore';
export function subscribeToUserProfile(userId, callback) {
    const ref = doc(db, USERS_COLLECTION, userId);
    return onSnapshot(ref, async (snap) => {
        if (snap.exists()) {
            callback(snap.data());
        } else {
            // Create profile if it doesn't exist yet
            const initial = { xp: 0, tasksCompleted: 0 };
            await setDoc(ref, initial);
            callback(initial);
        }
    });
}
