// Firestore task CRUD operations and real-time subscription
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

const TASKS_COLLECTION = 'tasks';

/**
 * Subscribe to a user's tasks in real-time.
 * Calls `callback` with the current task array whenever Firestore updates.
 * Calls `onError` if the listener fails (e.g. missing index or permissions).
 * Returns an unsubscribe function to stop listening.
 *
 * NOTE: orderBy is done client-side to avoid requiring a composite Firestore
 * index, which is the most common cause of silent real-time sync failures
 * in production/Vercel deployments.
 */
export function subscribeToTasks(userId, callback, onError) {
    const q = query(
        collection(db, TASKS_COLLECTION),
        where('userId', '==', userId)
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const tasks = snapshot.docs
                .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
                // Sort newest-first on the client (no composite index needed)
                .sort((a, b) => {
                    const ta = a.createdAt?.toMillis?.() ?? 0;
                    const tb = b.createdAt?.toMillis?.() ?? 0;
                    return tb - ta;
                });
            callback(tasks);
        },
        (error) => {
            console.error('[subscribeToTasks] Firestore error:', error);
            if (onError) onError(error);
        }
    );
}

/**
 * Add a new task for the current user.
 */
export async function addTask(userId, { title, description = '', category = 'personal', dueDate = null }) {
    return addDoc(collection(db, TASKS_COLLECTION), {
        userId,
        title,
        description,
        category,
        dueDate,
        completed: false,
        xpAwarded: false,
        createdAt: serverTimestamp(),
    });
}

/**
 * Update fields of an existing task.
 */
export async function updateTask(taskId, updates) {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    return updateDoc(taskRef, { ...updates });
}

/**
 * Delete a task permanently.
 */
export async function deleteTask(taskId) {
    return deleteDoc(doc(db, TASKS_COLLECTION, taskId));
}

/**
 * Toggle a task's completed state.
 * Returns true if task was just completed (for XP award logic).
 */
export async function toggleTask(taskId, currentCompleted, xpAwarded) {
    const updates = { completed: !currentCompleted };
    // Reset xpAwarded if un-completing
    if (currentCompleted) updates.xpAwarded = false;
    await updateDoc(doc(db, TASKS_COLLECTION, taskId), updates);
    return !currentCompleted && !xpAwarded; // newly completed?
}
