import React from 'react';
import { CharacterAvatarId } from '../types.js';

interface AvatarProps {
  id: CharacterAvatarId | string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showBadge?: boolean;
}

export const AVATAR_METADATA: Record<
  CharacterAvatarId,
  { name: string; species: string; bgGradient: string; accentColor: string; description: string }
> = {
  sakura_swan: {
    name: 'Sakura Swan',
    species: 'Graceful Swan',
    bgGradient: 'from-pink-100 to-rose-200 dark:from-pink-950 dark:to-rose-900',
    accentColor: '#f43f5e',
    description: 'Graceful and tranquil with soft petal-pink plumage and a golden crown.',
  },
  blossom_fox: {
    name: 'Blossom Fox',
    species: 'Wildflower Fox',
    bgGradient: 'from-rose-100 to-amber-200 dark:from-rose-950 dark:to-amber-950',
    accentColor: '#fb7185',
    description: 'Curious and romantic with soft amber fur and cherry blossom crown.',
  },
  starlight_bunny: {
    name: 'Starlight Bunny',
    species: 'Celestial Rabbit',
    bgGradient: 'from-purple-100 to-pink-200 dark:from-purple-950 dark:to-pink-950',
    accentColor: '#c084fc',
    description: 'Dreamy stargazer with moonlit ears and silver constellation blush.',
  },
  cosmic_cat: {
    name: 'Cosmic Cat',
    species: 'Amethyst Feline',
    bgGradient: 'from-violet-100 to-purple-200 dark:from-violet-950 dark:to-purple-900',
    accentColor: '#a855f7',
    description: 'Mystical purple kitten with crescent moon markings and golden eyes.',
  },
  velvet_bear: {
    name: 'Velvet Bear',
    species: 'Honey Bear',
    bgGradient: 'from-amber-100 to-rose-200 dark:from-amber-950 dark:to-rose-900',
    accentColor: '#f59e0b',
    description: 'Gentle guardian with a velvet heart emblem and warm, comforting gaze.',
  },
  enchanted_deer: {
    name: 'Enchanted Deer',
    species: 'Forest Fawn',
    bgGradient: 'from-emerald-100 to-pink-200 dark:from-emerald-950 dark:to-pink-950',
    accentColor: '#10b981',
    description: 'Quiet woodland soul with budding floral antlers and gentle green eyes.',
  },
  moonlit_owl: {
    name: 'Moonlit Owl',
    species: 'Twilight Owl',
    bgGradient: 'from-indigo-100 to-purple-200 dark:from-indigo-950 dark:to-purple-950',
    accentColor: '#6366f1',
    description: 'Philosophical night keeper with luminous star feathers and round kind eyes.',
  },
  ruby_dragon: {
    name: 'Ruby Dragon',
    species: 'Heart Dragonette',
    bgGradient: 'from-rose-200 to-red-200 dark:from-rose-950 dark:to-red-950',
    accentColor: '#e11d48',
    description: 'Playful miniature dragon with heart-shaped tail and warm sparkling breath.',
  },
  cupid_dove: {
    name: 'Cupid Dove',
    species: 'Messenger Dove',
    bgGradient: 'from-pink-100 to-indigo-100 dark:from-pink-950 dark:to-indigo-950',
    accentColor: '#ec4899',
    description: 'The messenger of love notes carrying a golden rosebud across the vault.',
  },
  ethereal_butterfly: {
    name: 'Ethereal Butterfly',
    species: 'Prism Lepidoptera',
    bgGradient: 'from-fuchsia-100 to-pink-200 dark:from-fuchsia-950 dark:to-pink-950',
    accentColor: '#d946ef',
    description: 'Delicate fluttering spirit with stained-glass wings shimmering in rose hues.',
  },
};

export const AvatarIllustration: React.FC<AvatarProps> = ({
  id,
  size = 'md',
  className = '',
  showBadge = false,
}) => {
  const avatarKey = (id in AVATAR_METADATA ? id : 'sakura_swan') as CharacterAvatarId;
  const meta = AVATAR_METADATA[avatarKey];

  const sizeClasses = {
    sm: 'w-9 h-9 text-[10px]',
    md: 'w-12 h-12 text-xs',
    lg: 'w-16 h-16 text-sm',
    xl: 'w-20 h-20 text-base',
    '2xl': 'w-28 h-28 text-lg',
  }[size];

  // Specific SVG illustrated faces
  const renderIllustration = () => {
    switch (avatarKey) {
      case 'sakura_swan':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-1.5" fill="none">
            {/* Swan Body */}
            <path
              d="M30 75 C30 55, 45 40, 55 35 C58 28, 62 20, 68 22 C73 24, 70 34, 62 42 C75 52, 78 72, 60 78 C45 82, 30 80, 30 75 Z"
              fill="#FFF1F2"
              stroke="#FB7185"
              strokeWidth="2.5"
            />
            {/* Wing Feathers */}
            <path
              d="M38 65 C48 55, 62 60, 68 68 C58 74, 45 74, 38 65 Z"
              fill="#FCE7F3"
              stroke="#F472B6"
              strokeWidth="2"
            />
            {/* Beak */}
            <polygon points="68,28 78,30 69,34" fill="#F59E0B" />
            {/* Eye */}
            <circle cx="63" cy="27" r="2.2" fill="#881337" />
            {/* Floral Crown */}
            <circle cx="56" cy="22" r="3" fill="#FDA4AF" />
            <circle cx="61" cy="18" r="3.5" fill="#F43F5E" />
            <circle cx="67" cy="19" r="3" fill="#FBCFE8" />
          </svg>
        );

      case 'blossom_fox':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-1.5" fill="none">
            {/* Fox Ears */}
            <polygon points="26,45 18,18 42,32" fill="#FB7185" stroke="#E11D48" strokeWidth="2" />
            <polygon points="28,40 24,24 38,33" fill="#FFE4E6" />
            <polygon points="74,45 82,18 58,32" fill="#FB7185" stroke="#E11D48" strokeWidth="2" />
            <polygon points="72,40 76,24 62,33" fill="#FFE4E6" />
            {/* Fox Face */}
            <polygon points="18,48 50,82 82,48 68,36 32,36" fill="#FDA4AF" stroke="#E11D48" strokeWidth="2" />
            {/* White Cheeks */}
            <polygon points="22,50 50,78 35,46" fill="#FFF1F2" />
            <polygon points="78,50 50,78 65,46" fill="#FFF1F2" />
            {/* Eyes */}
            <ellipse cx="36" cy="48" rx="2.5" ry="3.5" fill="#4C0519" />
            <ellipse cx="64" cy="48" rx="2.5" ry="3.5" fill="#4C0519" />
            {/* Nose */}
            <polygon points="47,72 53,72 50,76" fill="#881337" />
            {/* Blossom on ear */}
            <circle cx="28" cy="24" r="3" fill="#F43F5E" />
            <circle cx="28" cy="24" r="1.2" fill="#FEF08A" />
          </svg>
        );

      case 'starlight_bunny':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-1.5" fill="none">
            {/* Bunny Long Ears */}
            <ellipse cx="36" cy="28" rx="7" ry="22" fill="#F3E8FF" stroke="#C084FC" strokeWidth="2.5" transform="rotate(-10 36 28)" />
            <ellipse cx="36" cy="28" rx="3.5" ry="15" fill="#FCE7F3" transform="rotate(-10 36 28)" />
            <ellipse cx="64" cy="28" rx="7" ry="22" fill="#F3E8FF" stroke="#C084FC" strokeWidth="2.5" transform="rotate(10 64 28)" />
            <ellipse cx="64" cy="28" rx="3.5" ry="15" fill="#FCE7F3" transform="rotate(10 64 28)" />
            {/* Bunny Head */}
            <ellipse cx="50" cy="62" rx="28" ry="24" fill="#FAF5FF" stroke="#C084FC" strokeWidth="2.5" />
            {/* Eyes */}
            <ellipse cx="38" cy="60" rx="3.2" ry="4" fill="#581C87" />
            <circle cx="39" cy="59" r="1" fill="#FFFFFF" />
            <ellipse cx="62" cy="60" rx="3.2" ry="4" fill="#581C87" />
            <circle cx="63" cy="59" r="1" fill="#FFFFFF" />
            {/* Star Cheek Blush */}
            <polygon points="31,68 32,66 34,68 32,69" fill="#F472B6" />
            <polygon points="69,68 70,66 72,68 70,69" fill="#F472B6" />
            {/* Nose & Mouth */}
            <polygon points="48,67 52,67 50,69" fill="#E879F9" />
            <path d="M47 71 Q50 74 53 71" stroke="#C084FC" strokeWidth="1.5" strokeLinecap="round" />
            {/* Little Star Crest */}
            <polygon points="50,44 51.5,47.5 55,48.5 52,51 53,54.5 50,52.5 47,54.5 48,51 45,48.5 48.5,47.5" fill="#FDE047" />
          </svg>
        );

      case 'cosmic_cat':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-1.5" fill="none">
            {/* Cat Ears */}
            <polygon points="24,42 18,20 40,32" fill="#C084FC" stroke="#7E22CE" strokeWidth="2.5" />
            <polygon points="26,38 22,25 36,33" fill="#E9D5FF" />
            <polygon points="76,42 82,20 60,32" fill="#C084FC" stroke="#7E22CE" strokeWidth="2.5" />
            <polygon points="74,38 78,25 64,33" fill="#E9D5FF" />
            {/* Cat Head */}
            <circle cx="50" cy="58" r="26" fill="#F3E8FF" stroke="#7E22CE" strokeWidth="2.5" />
            {/* Crescent Moon on Forehead */}
            <path d="M52 40 A5 5 0 0 0 48 48 A4 4 0 0 1 52 40 Z" fill="#FACC15" />
            {/* Eyes */}
            <ellipse cx="38" cy="58" rx="4" ry="5" fill="#6B21A8" />
            <circle cx="39" cy="56" r="1.5" fill="#FFFFFF" />
            <ellipse cx="62" cy="58" rx="4" ry="5" fill="#6B21A8" />
            <circle cx="63" cy="56" r="1.5" fill="#FFFFFF" />
            {/* Nose & Whiskers */}
            <polygon points="48,66 52,66 50,68" fill="#A855F7" />
            <line x1="22" y1="64" x2="33" y2="66" stroke="#C084FC" strokeWidth="1.5" />
            <line x1="20" y1="70" x2="33" y2="69" stroke="#C084FC" strokeWidth="1.5" />
            <line x1="78" y1="64" x2="67" y2="66" stroke="#C084FC" strokeWidth="1.5" />
            <line x1="80" y1="70" x2="67" y2="69" stroke="#C084FC" strokeWidth="1.5" />
          </svg>
        );

      case 'velvet_bear':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-1.5" fill="none">
            {/* Bear Ears */}
            <circle cx="28" cy="32" r="10" fill="#FED7AA" stroke="#F97316" strokeWidth="2" />
            <circle cx="28" cy="32" r="5" fill="#FECDD3" />
            <circle cx="72" cy="32" r="10" fill="#FED7AA" stroke="#F97316" strokeWidth="2" />
            <circle cx="72" cy="32" r="5" fill="#FECDD3" />
            {/* Bear Head */}
            <circle cx="50" cy="58" r="28" fill="#FFEDD5" stroke="#F97316" strokeWidth="2.5" />
            {/* Muzzle */}
            <ellipse cx="50" cy="66" rx="14" ry="11" fill="#FFF7ED" />
            {/* Eyes */}
            <circle cx="38" cy="54" r="3" fill="#431407" />
            <circle cx="62" cy="54" r="3" fill="#431407" />
            {/* Heart Nose */}
            <path
              d="M50 63 C49 61, 46 61, 46 64 C46 66, 50 68, 50 69 C50 68, 54 66, 54 64 C54 61, 51 61, 50 63 Z"
              fill="#E11D48"
            />
            {/* Smile */}
            <path d="M47 70 Q50 73 53 70" stroke="#78350F" strokeWidth="1.5" />
          </svg>
        );

      case 'enchanted_deer':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-1.5" fill="none">
            {/* Antlers with flowers */}
            <path d="M36 34 Q30 20 22 16 M28 24 Q24 20 22 22" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="22" cy="16" r="3" fill="#FDA4AF" />
            <path d="M64 34 Q70 20 78 16 M72 24 Q76 20 78 22" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="78" cy="16" r="3" fill="#FDA4AF" />
            {/* Deer Ears */}
            <ellipse cx="26" cy="42" rx="5" ry="12" fill="#D1FAE5" stroke="#059669" strokeWidth="2" transform="rotate(-35 26 42)" />
            <ellipse cx="74" cy="42" rx="5" ry="12" fill="#D1FAE5" stroke="#059669" strokeWidth="2" transform="rotate(35 74 42)" />
            {/* Deer Face */}
            <polygon points="34,36 66,36 58,74 42,74" fill="#ECFDF5" stroke="#059669" strokeWidth="2" />
            {/* Large Friendly Eyes */}
            <ellipse cx="40" cy="50" rx="3.5" ry="5" fill="#064E3B" />
            <circle cx="41" cy="48" r="1.5" fill="#FFFFFF" />
            <ellipse cx="60" cy="50" rx="3.5" ry="5" fill="#064E3B" />
            <circle cx="61" cy="48" r="1.5" fill="#FFFFFF" />
            {/* Little Nose */}
            <circle cx="50" cy="71" r="2.5" fill="#047857" />
          </svg>
        );

      case 'cupid_dove':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-1.5" fill="none">
            {/* Golden Halo */}
            <ellipse cx="50" cy="22" rx="14" ry="4" stroke="#FBBF24" strokeWidth="2" />
            {/* Wings */}
            <path d="M22 55 C15 40, 28 32, 42 45 C35 55, 26 62, 22 55 Z" fill="#FCE7F3" stroke="#F43F5E" strokeWidth="2" />
            <path d="M78 55 C85 40, 72 32, 58 45 C65 55, 74 62, 78 55 Z" fill="#FCE7F3" stroke="#F43F5E" strokeWidth="2" />
            {/* Dove Body */}
            <ellipse cx="50" cy="58" rx="20" ry="24" fill="#FFF1F2" stroke="#F43F5E" strokeWidth="2" />
            {/* Eyes */}
            <ellipse cx="43" cy="52" rx="2.5" ry="3.5" fill="#881337" />
            <ellipse cx="57" cy="52" rx="2.5" ry="3.5" fill="#881337" />
            {/* Golden Rose in Beak */}
            <polygon points="48,60 52,60 50,64" fill="#F59E0B" />
            <circle cx="50" cy="69" r="4" fill="#E11D48" />
            <path d="M47 70 Q50 74 53 70" stroke="#10B981" strokeWidth="1.5" />
          </svg>
        );

      case 'ruby_dragon':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-1.5" fill="none">
            {/* Dragon Horns */}
            <polygon points="34,36 28,18 42,28" fill="#E11D48" stroke="#9F1239" strokeWidth="2" />
            <polygon points="66,36 72,18 58,28" fill="#E11D48" stroke="#9F1239" strokeWidth="2" />
            {/* Dragon Head */}
            <circle cx="50" cy="58" r="26" fill="#FFE4E6" stroke="#E11D48" strokeWidth="2" />
            {/* Eyes */}
            <ellipse cx="38" cy="54" rx="4" ry="5" fill="#9F1239" />
            <circle cx="39" cy="52" r="1.5" fill="#FEF08A" />
            <ellipse cx="62" cy="54" rx="4" ry="5" fill="#9F1239" />
            <circle cx="63" cy="52" r="1.5" fill="#FEF08A" />
            {/* Snout */}
            <ellipse cx="50" cy="68" rx="12" ry="8" fill="#FFF1F2" />
            <circle cx="47" cy="67" r="1.2" fill="#E11D48" />
            <circle cx="53" cy="67" r="1.2" fill="#E11D48" />
            {/* Sparkle puff */}
            <circle cx="50" cy="78" r="2" fill="#FDA4AF" />
          </svg>
        );

      case 'moonlit_owl':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-1.5" fill="none">
            {/* Owl Feather Tufts */}
            <polygon points="26,40 18,22 38,30" fill="#818CF8" />
            <polygon points="74,40 82,22 62,30" fill="#818CF8" />
            {/* Owl Body */}
            <ellipse cx="50" cy="58" rx="28" ry="26" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2" />
            {/* Eye Rings */}
            <circle cx="36" cy="52" r="10" fill="#FFFFFF" stroke="#818CF8" strokeWidth="2" />
            <circle cx="36" cy="52" r="4.5" fill="#312E81" />
            <circle cx="37" cy="50" r="1.5" fill="#FFFFFF" />
            <circle cx="64" cy="52" r="10" fill="#FFFFFF" stroke="#818CF8" strokeWidth="2" />
            <circle cx="64" cy="52" r="4.5" fill="#312E81" />
            <circle cx="65" cy="50" r="1.5" fill="#FFFFFF" />
            {/* Beak */}
            <polygon points="47,56 53,56 50,64" fill="#F59E0B" />
          </svg>
        );

      case 'ethereal_butterfly':
      default:
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-1.5" fill="none">
            {/* Butterfly Wings Upper */}
            <path d="M48 48 C30 20, 10 32, 22 55 C32 62, 45 52, 48 48 Z" fill="#F5D0FE" stroke="#C026D3" strokeWidth="2" />
            <path d="M52 48 C70 20, 90 32, 78 55 C68 62, 55 52, 52 48 Z" fill="#F5D0FE" stroke="#C026D3" strokeWidth="2" />
            {/* Lower Wings */}
            <path d="M47 52 C32 58, 26 76, 38 82 C48 80, 48 60, 47 52 Z" fill="#FCE7F3" stroke="#DB2777" strokeWidth="1.5" />
            <path d="M53 52 C68 58, 74 76, 62 82 C52 80, 52 60, 53 52 Z" fill="#FCE7F3" stroke="#DB2777" strokeWidth="1.5" />
            {/* Butterfly Body & Antennae */}
            <ellipse cx="50" cy="56" rx="3" ry="16" fill="#86198F" />
            <path d="M49 42 Q42 32 38 34" stroke="#86198F" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M51 42 Q58 32 62 34" stroke="#86198F" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl bg-gradient-to-br ${meta.bgGradient} shadow-sm border border-pink-200/60 dark:border-purple-800/60 transition-transform ${sizeClasses} ${className}`}
      title={`${meta.name} (${meta.species})`}
    >
      {renderIllustration()}
      {showBadge && (
        <span
          className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 bg-rose-500 shadow-xs"
          title="Romantic connection ready"
        />
      )}
    </div>
  );
};
