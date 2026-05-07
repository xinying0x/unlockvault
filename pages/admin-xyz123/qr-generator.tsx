/**
 * Admin QR Code Generator Page
 * Generate QR codes for offers/articles with CPA Content Locker links
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';
import { copyToClipboard } from '../../lib/copyToClipboard';

interface Offer {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  category: string;
  type: 'tool' | 'app' | 'game';
  views: number;
  unlocks: number;
  addedAt: string;
  featured?: boolean;
  rating: number;
}

interface QRResult {
  qrCode: string;
  cpaLink: string;
  offerTitle: string;
  offerType: string;
  offerImage: string;
}

const QRGenerator: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [qrResult, setQrResult] = useState<QRResult | null>(null);
  const [error, setError] = useState('');
  const [generatedCount, setGeneratedCount] = useState(0);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/offers?status=active&limit=100');
      if (response.ok) {
        const data = await response.json();
        setOffers(data);
      }
    } catch (err) {
      console.error('Failed to fetch offers:', err);
    }
  };

  const handleGenerateQR = async () => {
    if (!selectedOffer) {
      setError('Please select an offer first');
      return;
    }

    setLoading(true);
    setError('');
    setQrResult(null);

    try {
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: selectedOffer,
          type: 'offer',
          siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setQrResult(data.data);
        setGeneratedCount((prev) => prev + 1);
        setError('');
      } else {
        setError(data.error || 'Failed to generate QR code');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (qrResult?.cpaLink) {
      const success = await copyToClipboard(qrResult.cpaLink);
      if (success) {
        alert('CPA Link copied to clipboard!');
      } else {
        alert('Could not copy link (not in secure context).');
      }
    }
  };

  const handleDownloadQR = () => {
    if (qrResult?.qrCode) {
      const link = document.createElement('a');
      link.download = `qr-${qrResult.offerTitle}.png`;
      link.href = qrResult.qrCode;
      link.click();
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'game': return <span className="text-green-400">🎮 Game</span>;
      case 'app': return <span className="text-blue-400">📱 App</span>;
      case 'tool': return <span className="text-orange-400">🔧 Tool</span>;
      default: return <span className="text-gray-400">📦 Content</span>;
    }
  };

  return (
    <AdminLayout title="QR Code Generator">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              QR Code Generator 📲
            </h1>
            <p className="text-gray-400">
              Generate QR codes for offers/articles with CPA Content Locker
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-purple-600/20 px-4 py-2 rounded-lg border border-purple-500/30">
              <span className="text-purple-400 font-semibold">Generated:</span>{' '}
              <span className="text-white text-xl font-bold">{generatedCount}</span>
            </div>
            <Link
              href="/scan-qr"
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-lg transition-colors font-semibold"
            >
              Scan QR Page
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => setError('')}
              className="ml-4 text-red-400 hover:text-red-300 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side: Offer Selection */}
          <div className="space-y-6">
            {/* Selection Card */}
            <div className="bg-[#2D1B5A]/50 backdrop-blur-sm p-6 rounded-xl border border-purple-900/30">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>📝</span>
                Select Offer
              </h2>

              {/* Search/Filter */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search offers..."
                  onChange={(e) => {
                    const term = e.target.value.toLowerCase();
                    const filtered = offers.filter(
                      (o) =>
                        o.title.toLowerCase().includes(term) ||
                        o.category.toLowerCase().includes(term)
                    );
                    setOffers(filtered);
                  }}
                  className="w-full px-4 py-3 bg-[#1C1535]/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              {/* Offers Dropdown */}
              <div className="max-h-96 overflow-y-auto space-y-2 custom-scrollbar">
                {offers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No offers available
                  </div>
                ) : (
                  offers.map((offer) => (
                    <div
                      key={offer.id}
                      onClick={() => {
                        setSelectedOffer(offer.id);
                        setQrResult(null);
                        setError('');
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        selectedOffer === offer.id
                          ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/50'
                          : 'hover:bg-[#1C1535]/50 border border-transparent'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <img
                          src={offer.image}
                          alt={offer.title}
                          className="w-10 h-10 rounded-lg object-cover border border-purple-900/30"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://via.placeholder.com/40x40?text=No+Image';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">{offer.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                          {getTypeBadge(offer.type)}
                          <span className="text-purple-500/70">|</span>
                          <span>{offer.category}</span>
                        </div>
                      </div>
                      {selectedOffer === offer.id && (
                        <div className="text-purple-400">
                          ✓
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Generate Button */}
            <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 backdrop-blur-sm p-6 rounded-xl border border-purple-900/30">
              <h3 className="text-lg font-semibold text-white mb-4">
                Generate QR Code
              </h3>
              <button
                onClick={handleGenerateQR}
                disabled={!selectedOffer || loading}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all transform ${
                  !selectedOffer || loading
                    ? 'bg-gray-700/40 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-900/30'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating QR...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>📱</span>
                    Generate QR Code
                  </span>
                )}
              </button>
              <p className="text-xs text-gray-500 mt-3 text-center">
                This will create a QR code that redirects to a CPA Content Locker page
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-[#1C1535]/30 border border-purple-900/20 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <span>ℹ️</span>
                How to use
              </h3>
              <ol className="text-xs text-gray-400 space-y-2 list-decimal list-inside">
                <li>Select an offer from the list</li>
                <li>Click "Generate QR Code"</li>
                <li>Download or copy the QR code</li>
                <li>Upload to TikTok/Instagram/Reels</li>
                <li>Users scan and go to Content Locker</li>
              </ol>
            </div>
          </div>

          {/* Right Side: QR Result */}
          <div className="space-y-6">
            {/* Result Card */}
            <div className="bg-[#2D1B5A]/50 backdrop-blur-sm p-6 rounded-xl border border-purple-900/30 min-h-[400px]">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🎨</span>
                QR Result
              </h2>

              {!qrResult ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <div className="w-24 h-24 rounded-full bg-[#1C1535]/50 flex items-center justify-center mb-4">
                    <span className="text-4xl opacity-30">📱</span>
                  </div>
                  <p className="text-gray-400 mb-4">
                    Generate a QR code to see the result here
                  </p>
                  <div className="text-sm text-gray-500 bg-[#1C1535]/30 px-4 py-2 rounded-lg">
                    QR Code will appear here after generation
                  </div>
                </div>
              ) : (
                <>
                  {/* QR Code Display */}
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                      <div className="relative bg-white p-4 rounded-2xl border-4 border-purple-500/20 shadow-2xl">
                        <img
                          src={qrResult.qrCode}
                          alt="QR Code"
                          className="w-64 h-64 object-contain"
                        />
                      </div>
                    </div>

                    {/* QR Info */}
                    <div className="text-center w-full">
                      <h3 className="text-white text-xl font-bold mb-2 truncate">
                        {qrResult.offerTitle}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        {qrResult.offerType.toUpperCase()} • CPA Content Locker
                      </p>

                      {/* CPA Link */}
                      <div className="bg-[#1C1535]/50 rounded-lg p-3 mb-4 w-full overflow-x-auto">
                        <p className="text-xs text-gray-400 mb-2">CPA Link:</p>
                        <div className="flex items-center gap-2">
                          <code className="text-sm text-blue-400 break-all">
                            {qrResult.cpaLink}
                          </code>
                          <button
                            onClick={handleCopyLink}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 w-full">
                        <button
                          onClick={handleDownloadQR}
                          className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02]"
                        >
                          Download QR
                        </button>
                        <button
                          onClick={async () => {
                            const success = await copyToClipboard(qrResult.qrCode);
                            if (success) {
                              alert('QR Code data copied to clipboard!');
                            }
                          }}
                          className="px-4 py-3 bg-[#1C1535] hover:bg-[#2D1B5A] text-white rounded-xl transition-colors border border-purple-900/30"
                          title="Copy QR Data"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Stats */}
            {qrResult && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1C1535]/30 border border-purple-900/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    1
                  </div>
                  <div className="text-xs text-gray-400">Offer Unlocked</div>
                </div>
                <div className="bg-[#1C1535]/30 border border-purple-900/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    CPA
                  </div>
                  <div className="text-xs text-gray-400">Content Locker</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default QRGenerator;
