// Firestore task CRUD operations and real-time subscription
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

const TASKS_COLLECTION = 'tasks';

/**
 * Subscribe to a user's tasks in real-time.
 * Calls `callback` with the current task array whenever Firestore updates.
 * Returns an unsubscribe function to stop listening.
 */
export function subscribeToTasks(userId, callback) {
    const q = query(
        collection(db, TASKS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
        }));
        callback(tasks);
    });
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
