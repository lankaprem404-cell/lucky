import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

interface LLHeartsBrandProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showSubtitle?: boolean;
  className?: string;
}

export const LLHeartsBrand: React.FC<LLHeartsBrandProps> = ({
  size = 'md',
  showSubtitle = false,
  className = '',
}) => {
  if (size === 'sm') {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 shadow-md shadow-pink-500/30 text-white font-['Outfit'] font-extrabold text-xs tracking-tighter">
          <span>LL</span>
          <Heart className="w-2.5 h-2.5 absolute -top-1 -right-1 text-pink-300 fill-pink-300 animate-pulse" />
        </div>
        <span className="font-['Outfit'] font-bold text-sm tracking-tight bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
          LL Hearts
        </span>
      </div>
    );
  }

  if (size === 'hero') {
    return (
      <div className={`flex flex-col items-center text-center space-y-3 ${className}`}>
        {/* Glowing Monogram Emblem */}
        <div className="relative group">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 opacity-60 blur-md group-hover:opacity-90 animate-pulse transition duration-1000"></div>
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-rose-600 via-pink-500 to-purple-600 p-0.5 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full bg-white/10 backdrop-blur-xs rounded-[22px] flex flex-col items-center justify-center text-white">
              <div className="flex items-center justify-center gap-0.5 font-['Outfit'] font-black text-3xl sm:text-4xl tracking-tighter drop-shadow-md">
                <span>L</span>
                <Heart className="w-5 h-5 text-pink-300 fill-pink-300 mx-0.5 animate-bounce" />
                <span>L</span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-pink-200 mt-0.5">
                HEARTS
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/70 dark:bg-purple-950/60 border border-rose-200 dark:border-purple-800 text-xs font-semibold text-rose-600 dark:text-pink-300 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>LL Hearts · Signature Love Vault Edition</span>
          </div>
          <h2 className="font-['Outfit'] font-extrabold text-2xl sm:text-3xl tracking-tight bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Love Vault &amp; LL Hearts
          </h2>
          {showSubtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Mandatory default theme with luminous initials, romantic pink and purple accents, and encrypted message requests.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 shadow-md shadow-pink-500/30 text-white font-['Outfit'] font-black text-sm tracking-tighter">
        <span>LL</span>
        <Heart className="w-3 h-3 absolute -top-1 -right-1 text-pink-300 fill-pink-300" />
      </div>
      <div>
        <div className="font-['Outfit'] font-bold text-base tracking-tight bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1">
          <span>Love Vault</span>
          <span className="text-xs px-1.5 py-0.2 rounded-md bg-rose-100 dark:bg-purple-900/60 text-rose-600 dark:text-pink-300 font-semibold">
            LL ♥
          </span>
        </div>
        {showSubtitle && (
          <div className="text-[10px] text-slate-400 font-medium tracking-tight">
            LL Hearts Default Theme
          </div>
        )}
      </div>
    </div>
  );
};
