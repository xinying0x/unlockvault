/**
 * QR Code Redirect Page
 * Page: Decode QR code and redirect to offer/article
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface DecodedQR {
  success: boolean;
  url?: string;
  error?: string;
}

export default function QRDecodePage() {
  const router = useRouter();
  const [image, setImage] = useState<string>('');
  const [decoding, setDecoding] = useState(false);
  const [result, setResult] = useState<DecodedQR | null>(null);
  const [error, setError] = useState('');

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImage(result as string);
      decodeQR(result as string);
    };
    reader.readAsDataURL(file);
  };

  // Decode QR code from image
  const decodeQR = useCallback(async (imageData: string) => {
    setDecoding(true);
    setResult(null);
    setError('');

    try {
      const response = await fetch('/api/qr/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),
      });

      const data: DecodedQR = await response.json();
      setResult(data);

      if (data.success && data.url) {
        // Parse URL to get slug
        try {
          const urlObj = new URL(data.url);
          const pathParts = urlObj.pathname.split('/');
          const slug = pathParts[pathParts.length - 1];

          // Redirect to unlock page after a delay
          setTimeout(() => {
            router.push(`/unlock/${slug}`);
          }, 1500);
        } catch (e) {
          console.log('Invalid URL format:', data.url);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to decode QR code');
    } finally {
      setDecoding(false);
    }
  }, [router]);

  // Handle URL input
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image.startsWith('data:image')) {
      setError('Please upload an image first or paste a valid image URL');
      return;
    }
    decodeQR(image);
  };

  // Clear upload
  const handleClear = () => {
    setImage('');
    setResult(null);
    setError('');
  };

  return (
    <>
      <Head>
        <title>Scan QR Code | UnlockVault</title>
        <meta name="description" content="Scan QR code to unlock offers and content" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-[#0D0B1E] via-[#1A0B33] to-[#0D0B1E] text-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                📲 Scan QR Code
              </span>
            </h1>
            <p className="text-gray-400">
              Upload a screenshot of the QR code or paste an image URL to unlock content
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-[#1C1535]/60 rounded-3xl border border-purple-900/30 p-6 mb-8 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              {/* Upload Input */}
              <div className="w-full">
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Upload QR Screenshot
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-400
                      file:mr-4 file:py-3 file:px-4
                      file:rounded-xl file:border-0
                      file:text-sm file:font-semibold
                      file:bg-gradient-to-r file:from-purple-600 file:to-pink-600
                      file:text-white hover:file:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500
                      cursor-pointer"
                  />
                </div>
              </div>

              {/* Image Preview */}
              {image && (
                <div className="relative w-48 h-48 mx-auto mt-4 rounded-2xl overflow-hidden border-4 border-purple-500/30 shadow-2xl">
                  <img
                    src={image}
                    alt="Uploaded QR"
                    className="w-full h-full object-contain bg-[#0D0B1E]"
                  />
                  <button
                    onClick={handleClear}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition"
                    title="Clear"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-6 text-center">
              <button
                onClick={handleUrlSubmit}
                disabled={!image || decoding}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all transform ${
                  !image || decoding
                    ? 'bg-gray-700/40 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white hover:scale-[1.02] active:scale-[0.98]'
                } shadow-lg shadow-green-900/30`}
              >
                {decoding ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    Scanning QR Code...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>🔍</span>
                    Scan & Unlock
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className={`rounded-2xl p-5 mb-6 ${result.success ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
              <h3 className={`font-bold mb-2 ${result.success ? 'text-green-300' : 'text-red-300'}`}>
                {result.success ? '✅ QR Code Decoded Successfully' : '❌ Decoding Failed'}
              </h3>
              {result.url && (
                <p className="text-gray-400 text-sm break-all mb-3">
                  <strong className="text-gray-300">URL:</strong> {result.url}
                </p>
              )}
              {result.error && (
                <p className="text-red-300 text-sm">{result.error}</p>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-center">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="bg-[#0D0B1E]/50 rounded-2xl p-6 text-center border border-purple-900/20">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-2xl">ℹ️</span>
              <span className="text-lg font-semibold text-gray-300">How It Works</span>
            </div>
            <ol className="text-sm text-gray-400 space-y-2 max-w-lg mx-auto">
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 text-xs font-bold">1</span>
                Upload screenshot of QR code from TikTok/Instagram
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 text-xs font-bold">2</span>
                System decodes QR and finds the offer
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 text-xs font-bold">3</span>
                Redirects to Content Locker to unlock
              </li>
            </ol>
          </div>

          {/* Back Link */}
          <div className="text-center mt-8">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
