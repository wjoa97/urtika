import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errorHandler';
import { AllergyReaction } from '../types/allergy';
import { useAuth } from './AuthContext';
import { INITIAL_REACTIONS } from '../data/initialData';

export function useUserReactions() {
  const { user, loading: authLoading } = useAuth();
  const [reactions, setReactions] = useState<AllergyReaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Read reactions strictly for the authenticated user
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // If not logged in, read from isolated local storage fallback
      try {
        const localData = localStorage.getItem('allergy_reactions_data_guest');
        if (localData) {
          setReactions(JSON.parse(localData));
        } else {
          setReactions(INITIAL_REACTIONS);
        }
      } catch (e) {
        setReactions(INITIAL_REACTIONS);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    const userReactionsPath = `users/${user.uid}/reactions`;
    const reactionsRef = collection(db, 'users', user.uid, 'reactions');
    const q = query(reactionsRef, orderBy('fecha', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: AllergyReaction[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loaded.push({
            id: docSnap.id,
            fecha: data.fecha || '',
            fechaFormateada: data.fechaFormateada || '',
            semana: data.semana || 1,
            ubicacion: data.ubicacion || '',
            ubicacionCuerpo: data.ubicacionCuerpo || '',
            cuerpoZonasSeleccionadas: data.cuerpoZonasSeleccionadas || [],
            ronchas: data.ronchas || 0,
            prurito: data.prurito || 0,
            puntuacionDia: data.puntuacionDia || 0,
            tomoMedicamento: Boolean(data.tomoMedicamento),
            medicamento: data.medicamento || '',
            tiempoDesaparecer: data.tiempoDesaparecer || '',
            notas: data.notas || '',
            detonantes: data.detonantes || [],
            creadoEn: data.creadoEn || '',
          });
        });

        setReactions(loaded);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, userReactionsPath);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading]);

  // Save (Create or Update) reaction strictly in user's isolated subcollection
  const saveReaction = async (reaction: AllergyReaction) => {
    if (!user) {
      // Local fallback
      setReactions((prev) => {
        const idx = prev.findIndex((r) => r.id === reaction.id);
        const updated = idx >= 0 ? [...prev] : [reaction, ...prev];
        if (idx >= 0) updated[idx] = reaction;
        localStorage.setItem('allergy_reactions_data_guest', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    const path = `users/${user.uid}/reactions/${reaction.id}`;
    try {
      await setDoc(
        doc(db, 'users', user.uid, 'reactions', reaction.id),
        {
          ...reaction,
          userId: user.uid,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  // Delete reaction strictly from user's isolated subcollection
  const deleteReaction = async (reactionId: string) => {
    if (!user) {
      setReactions((prev) => {
        const updated = prev.filter((r) => r.id !== reactionId);
        localStorage.setItem('allergy_reactions_data_guest', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    const path = `users/${user.uid}/reactions/${reactionId}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'reactions', reactionId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // Batch import reactions (e.g. from CSV)
  const importMultipleReactions = async (newReactions: AllergyReaction[]) => {
    if (!user) {
      setReactions((prev) => {
        const combined = [...newReactions, ...prev];
        localStorage.setItem('allergy_reactions_data_guest', JSON.stringify(combined));
        return combined;
      });
      return;
    }

    try {
      await Promise.all(
        newReactions.map((item) =>
          setDoc(
            doc(db, 'users', user.uid, 'reactions', item.id),
            {
              ...item,
              userId: user.uid,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          )
        )
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/reactions`);
    }
  };

  // Clear all reactions
  const clearAllReactions = async () => {
    if (!user) {
      setReactions([]);
      localStorage.setItem('allergy_reactions_data_guest', JSON.stringify([]));
      return;
    }

    try {
      await Promise.all(
        reactions.map((r) =>
          deleteDoc(doc(db, 'users', user.uid, 'reactions', r.id))
        )
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/reactions`);
    }
  };

  return {
    reactions,
    loading: loading || authLoading,
    saveReaction,
    deleteReaction,
    importMultipleReactions,
    clearAllReactions,
  };
}
