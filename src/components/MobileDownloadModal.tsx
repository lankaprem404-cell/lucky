import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  QrCode,
  Copy,
  Check,
  Download,
  Share2,
  ExternalLink,
  Sparkles,
  Heart,
  ShieldCheck,
} from 'lucide-react';
import QRCode from 'qrcode';
import { usePWAInstall } from '../usePWAInstall.js';
import { LLHeartsBrand } from './LLHeartsBrand.js';

interface MobileDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  sharedUrl: string;
}

export const MobileDownloadModal: React.FC<MobileDownloadModalProps> = ({
  isOpen,
  onClose,
  sharedUrl,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activePlatform, setActivePlatform] = useState<'scan' | 'android' | 'ios'>('scan');

  useEffect(() => {
    if (sharedUrl) {
      QRCode.toDataURL(sharedUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#881337',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Failed to generate QR Code', err));
    }
  }, [sharedUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sharedUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Love Vault - Download Mobile App',
          text: 'Join me on Love Vault! Download the app for free with 12 romantic themes and secure message requests.',
          url: sharedUrl,
        });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-purple-900/60 overflow-hidden p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 flex items-center justify-center mx-auto text-white shadow-lg shadow-pink-500/25">
            <Smartphone className="w-6 h-6" />
          </div>
          <h2 className="font-['Outfit'] font-bold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100">
            Download Love Vault on Mobile
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Installable on <strong>any iPhone, Android, or tablet</strong> as a standalone Progressive Web App with offline support, home screen icon, and zero app store fees.
          </p>
        </div>

        {/* Platform Selection Tabs */}
        <div className="flex items-center justify-center gap-1.5 p-1 rounded-2xl bg-rose-50/70 dark:bg-purple-950/40 border border-rose-100 dark:border-purple-900/40">
          <button
            onClick={() => setActivePlatform('scan')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
              activePlatform === 'scan'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-pink-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan with Phone</span>
          </button>

          <button
            onClick={() => setActivePlatform('android')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
              activePlatform === 'android'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-pink-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Android / Chrome</span>
          </button>

          <button
            onClick={() => setActivePlatform('ios')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
              activePlatform === 'ios'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-pink-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>iPhone / iPad</span>
          </button>
        </div>

        {/* Tab 1: Scan QR Code */}
        {activePlatform === 'scan' && (
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="p-4 bg-white rounded-3xl border-2 border-rose-100 shadow-xl inline-block">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code to open Love Vault on mobile"
                  className="w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-xl"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                  Generating QR Code...
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                Point your phone camera at the QR code
              </span>
              <p className="text-xs text-slate-500 max-w-sm">
                Open your mobile camera or QR scanner to launch the app instantly in Safari or Chrome.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Android Instructions & Install Button */}
        {activePlatform === 'android' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-purple-950/40 border border-rose-100 dark:border-purple-900/40 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-pink-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Android Installation Steps (Chrome, Samsung Internet, Edge)</span>
              </div>
              <ol className="text-xs text-slate-700 dark:text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                <li>
                  Open the app link in <strong>Google Chrome</strong> or <strong>Samsung Internet</strong>.
                </li>
                <li>
                  Tap the <strong>"Install App"</strong> button below, or tap the three dots <strong>(⋮)</strong> in the top-right corner.
                </li>
                <li>
                  Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                </li>
                <li>
                  The Love Vault heart icon will appear on your mobile home screen and launch in full-screen standalone mode!
                </li>
              </ol>
            </div>

            {isInstallable && (
              <button
                onClick={install}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold text-sm shadow-xl shadow-pink-500/25 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Install Love Vault App Now</span>
              </button>
            )}
          </div>
        )}

        {/* Tab 3: iPhone / iPad Instructions */}
        {activePlatform === 'ios' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 space-y-3">
              <div className="flex items-center gap-2 text-purple-600 dark:text-pink-400 font-bold text-xs uppercase tracking-wider">
                <Share2 className="w-4 h-4" />
                <span>iOS Safari Installation Steps (iPhone &amp; iPad)</span>
              </div>
              <ol className="text-xs text-slate-700 dark:text-slate-300 space-y-2.5 list-decimal list-inside leading-relaxed">
                <li>
                  Open the app link in <strong>Safari</strong> on your iPhone or iPad.
                </li>
                <li>
                  Tap the <strong>Share</strong> button at the bottom of Safari (the square with an arrow pointing up).
                </li>
                <li>
                  Scroll down the share sheet and tap <strong>"Add to Home Screen"</strong> (➕ icon).
                </li>
                <li>
                  Tap <strong>"Add"</strong> in the top-right corner.
                </li>
                <li>
                  Love Vault is now installed on your home screen with its glowing LL Hearts icon!
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Direct App Link URL & Copy Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-purple-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Direct App Link (Universal)</span>
            <span className="text-[11px] text-rose-500 font-mono">Mobile Optimized</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={sharedUrl}
              className="w-full p-2.5 text-xs font-mono rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-purple-800 text-slate-700 dark:text-slate-200 select-all"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-purple-600 rounded-xl shadow-xs shrink-0 hover:opacity-90 transition-opacity"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              onClick={handleNativeShare}
              className="p-2.5 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-purple-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Share link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PWA Benefits Footer */}
        <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500 pt-1">
          <div className="p-2 rounded-xl bg-rose-50/50 dark:bg-purple-950/20">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Standalone</span>
            No browser address bar
          </div>
          <div className="p-2 rounded-xl bg-rose-50/50 dark:bg-purple-950/20">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">All 12 Themes</span>
            100% Free Forever
          </div>
          <div className="p-2 rounded-xl bg-rose-50/50 dark:bg-purple-950/20">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Real-time</span>
            Instant push requests
          </div>
        </div>
      </div>
    </div>
  );
};
