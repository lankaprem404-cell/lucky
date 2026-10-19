import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  Heart,
  Plus,
  Calendar,
  Sparkles,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { User, VaultMemory } from '../types.js';

interface PrivateVaultViewProps {
  currentUser: User;
  partnerId?: string;
  onNavigateToSearch: () => void;
}

export const PrivateVaultView: React.FC<PrivateVaultViewProps> = ({
  currentUser,
  partnerId,
  onNavigateToSearch,
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [memories, setMemories] = useState<VaultMemory[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newCategory, setNewCategory] = useState<
    'milestone' | 'date_night' | 'love_letter' | 'secret_promise'
  >('love_letter');
  const [isAdding, setIsAdding] = useState(false);

  const fetchMemories = async () => {
    try {
      const pid = partnerId || currentUser.id;
      const res = await fetch(`/api/vault/${pid}/memories`, {
        headers: { 'x-user-id': currentUser.id },
      });
      if (res.ok) {
        const data = await res.json();
        setMemories(data.memories || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      fetchMemories();
    }
  }, [isUnlocked, partnerId]);

  const handleKeyClick = (num: string) => {
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + num;
      setEnteredPin(nextPin);
      setPinError(null);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setPinError(null);
  };

  const verifyPin = async (pin: string) => {
    try {
      const pid = partnerId || currentUser.id;
      const res = await fetch(`/api/vault/${pid}/verify-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        setIsUnlocked(true);
        setPinError(null);
      } else {
        setPinError('Invalid Love Vault PIN. Default is 1234.');
        setEnteredPin('');
      }
    } catch {
      setPinError('Error verifying PIN');
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newNote.trim()) return;

    try {
      const pid = partnerId || currentUser.id;
      const res = await fetch(`/api/vault/${pid}/memories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          title: newTitle,
          note: newNote,
          category: newCategory,
          date: new Date().toISOString().split('T')[0],
        }),
      });

      if (res.ok) {
        setNewTitle('');
        setNewNote('');
        setIsAdding(false);
        fetchMemories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      {!isUnlocked ? (
        /* Locked PIN Screen */
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-purple-900/60 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-pink-500/20 text-white">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="font-['Outfit'] font-bold text-2xl text-slate-900 dark:text-slate-100">
              Private Love Vault
            </h2>
            <p className="text-xs text-slate-500">
              Enter 4-digit PIN passcode to unlock secret letters &amp; memories
            </p>
            <div className="text-[11px] text-purple-600 dark:text-pink-400 font-mono">
              (Default PIN: 1234)
            </div>
          </div>

          {/* PIN Dots */}
          <div className="flex items-center justify-center gap-3 py-2">
            {[0, 1, 2, 3].map((idx) => {
              const filled = idx < enteredPin.length;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all ${
                    filled
                      ? 'bg-rose-500 scale-110 shadow-xs'
                      : 'border-2 border-slate-300 dark:border-slate-700'
                  }`}
                />
              );
            })}
          </div>

          {pinError && (
            <p className="text-xs font-medium text-red-500 animate-shake">{pinError}</p>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyClick(digit)}
                className="w-16 h-14 rounded-2xl bg-rose-50/70 dark:bg-purple-950/40 hover:bg-rose-100 dark:hover:bg-purple-900/40 text-slate-800 dark:text-slate-100 font-bold text-lg font-mono transition-colors active:scale-95"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setEnteredPin('')}
              className="w-16 h-14 rounded-2xl text-xs font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKeyClick('0')}
              className="w-16 h-14 rounded-2xl bg-rose-50/70 dark:bg-purple-950/40 hover:bg-rose-100 dark:hover:bg-purple-900/40 text-slate-800 dark:text-slate-100 font-bold text-lg font-mono transition-colors active:scale-95"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="w-16 h-14 rounded-2xl text-xs font-semibold text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              ⌫
            </button>
          </div>

          <div className="pt-2 text-[11px] text-slate-400">
            Protected by Love Vault Security Engine
          </div>
        </div>
      ) : (
        /* Unlocked Vault Screen */
        <div className="space-y-6">
          {/* Hero Banner with Generated Image */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-rose-200/60 dark:border-purple-800/60 h-64 sm:h-72">
            <img
              src="/src/assets/images/love_vault_hero_1792388708201.jpg"
              alt="Love Vault romantic crystalline floating heart"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Unlocked Couple Sanctuary</span>
                  </div>
                  <h1 className="font-['Outfit'] font-bold text-2xl sm:text-3xl text-white">
                    Private Love Vault &amp; Memories
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl">
                    A private sanctuary for whispered promises, secret memories, and milestones shared between connected soulmates.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsUnlocked(false);
                    setEnteredPin('');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock Vault</span>
                </button>
              </div>
            </div>
          </div>

          {/* Add Memory Button & Form */}
          <div className="flex items-center justify-between">
            <h2 className="font-['Outfit'] font-bold text-xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-rose-500" />
              <span>Secret Love Letters &amp; Promises</span>
            </h2>

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-purple-600 rounded-xl shadow-xs hover:from-rose-600 hover:to-purple-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Inscribe Memory</span>
            </button>
          </div>

          {isAdding && (
            <form
              onSubmit={handleAddMemory}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-purple-800 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Memory Title (e.g. Starry Night Promise)"
                  className="p-3 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-rose-100 dark:border-purple-900 text-slate-800 dark:text-slate-100"
                  required
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="p-3 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-rose-100 dark:border-purple-900 text-slate-800 dark:text-slate-100"
                >
                  <option value="love_letter">Love Letter</option>
                  <option value="milestone">Milestone</option>
                  <option value="date_night">Date Night</option>
                  <option value="secret_promise">Secret Promise</option>
                </select>
              </div>

              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write your secret memory note..."
                rows={3}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-rose-100 dark:border-purple-900 text-slate-800 dark:text-slate-100"
                required
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-500 rounded-xl hover:bg-rose-600"
                >
                  Save In Vault
                </button>
              </div>
            </form>
          )}

          {/* Memories Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {memories.map((mem) => (
              <div
                key={mem.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-purple-900/40 shadow-xs space-y-2 relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="capitalize text-rose-500 font-semibold flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-rose-500" />
                    <span>{mem.category.replace('_', ' ')}</span>
                  </span>
                  <span className="font-mono text-[11px]">{mem.date}</span>
                </div>

                <h3 className="font-['Outfit'] font-bold text-base text-slate-900 dark:text-slate-100">
                  {mem.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  "{mem.note}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
