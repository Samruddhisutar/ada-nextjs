"use client";

import { useEffect, useState } from "react";
import { auth, provider, db } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

type Note = {
  id: string;
  text: string;
  uid: string;
  email: string;
  createdAt: number;
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setNotes([]);
      return;
    }

    const fetchNotes = async () => {
      const q = query(collection(db, "notes"), where("uid", "==", user.uid));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Note[];

      data.sort((a, b) => b.createdAt - a.createdAt);
      setNotes(data);
    };

    fetchNotes();
  }, [user]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Sign in error:", error);
      alert("Sign in failed");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleAddNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      alert("Please sign in first.");
      return;
    }

    if (!note.trim()) {
      alert("Enter a note first.");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "notes"), {
        text: note,
        uid: user.uid,
        email: user.email ?? "",
        createdAt: Date.now(),
      });

      setNote("");

      const q = query(collection(db, "notes"), where("uid", "==", user.uid));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Note[];

      data.sort((a, b) => b.createdAt - a.createdAt);
      setNotes(data);
    } catch (error) {
      console.error("Add note error:", error);
      alert("Failed to add note");
    } finally {
      setLoading(false);
    }
  };

  return (
      <main className="min-h-screen bg-black text-white p-8">
        <div className="max-w-2xl mx-auto bg-gray-900 shadow-md rounded-2xl p-6">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">ADA Consortium 2.0</h1>
          <p className="text-gray-700 mb-6">
            Hello!
          </p>

          {!user ? (
              <button
                  onClick={handleGoogleSignIn}
                  className="bg-black text-white px-4 py-2 rounded-xl"
              >
                Sign in with Google
              </button>
          ) : (
              <div className="mb-6">
                <p className="mb-3 text-gray-900">
                  Signed in as <span className="font-semibold text-gray-900">{user.email}</span>
                </p>
                <button
                    onClick={handleSignOut}
                    className="border border-gray-300 text-gray-900 px-4 py-2 rounded-xl bg-white"
                >
                  Sign out
                </button>
              </div>
          )}

          <form onSubmit={handleAddNote} className="flex flex-col gap-3 mb-8">
        <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write a note..."
            className="border border-gray-300 rounded-xl p-3 min-h-[100px] text-gray-900 placeholder:text-gray-500 bg-white"
        />
            <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl disabled:opacity-50"
            >
              {loading ? "Saving..." : "Add Note"}
            </button>
          </form>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">Your Notes</h2>
            {notes.length === 0 ? (
                <p className="text-gray-600">No notes yet.</p>
            ) : (
                <div className="space-y-3">
                  {notes.map((item) => (
                      <div key={item.id} className="border border-gray-300 rounded-xl p-4 bg-white">
                        <p className="text-gray-900">{item.text}</p>
                      </div>
                  ))}
                </div>
            )}
          </div>
        </div>
      </main>
  );
}