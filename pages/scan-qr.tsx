import { useCallback, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import jsQR from 'jsqr';

interface ScanResult {
  url: string;
  slug: string;
}

export default function QRDecodePage() {
  const router = useRouter();
  const [image, setImage] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');

  const getUnlockSlug = (value: string) => {
    try {
      const url = new URL(value);
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts[0] !== 'unlock' || !parts[1]) return null;
      return parts[1];
    } catch {
      return null;
    }
  };

  const decodeImage = useCallback((imageData: string) => {
    setScanning(true);
    setError('');
    setResult(null);

    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
          setError('Your browser cannot scan this image.');
          return;
        }

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        context.drawImage(img, 0, 0);

        const imagePixels = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imagePixels.data, imagePixels.width, imagePixels.height);
        if (!code?.data) {
          setError('No QR code found. Try a clearer screenshot.');
          return;
        }

        const slug = getUnlockSlug(code.data);
        if (!slug) {
          setError('This QR code is not an UnlockVault unlock link.');
          return;
        }

        setResult({ url: code.data, slug });
        window.setTimeout(() => router.push(`/unlock/${slug}`), 900);
      } catch (err) {
        console.error('QR scan failed:', err);
        setError('Could not scan this image. Try another screenshot.');
      } finally {
        setScanning(false);
      }
    };

    img.onerror = () => {
      setScanning(false);
      setError('Could not load this image.');
    };

    img.src = imageData;
  }, [router]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const dataUrl = String(readerEvent.target?.result || '');
      setImage(dataUrl);
      decodeImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setImage('');
    setResult(null);
    setError('');
  };

  return (
    <>
      <Head>
        <title>Scan QR Code | UnlockVault</title>
        <meta name="description" content="Upload a QR screenshot and open the UnlockVault unlock page." />
      </Head>

      <main className="min-h-screen bg-[#0D0B1E] text-white">
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.2),transparent_35%)] px-4 py-10">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <Link href="/" className="text-sm font-semibold text-purple-300 hover:text-purple-200">
                UnlockVault
              </Link>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-white">Scan QR Code</h1>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-400">
                Upload a screenshot from the video. The page will read the QR code and open the correct unlock page.
              </p>
            </div>

            <section className="rounded-3xl border border-white/10 bg-[#140F27]/85 p-6 shadow-2xl shadow-purple-950/20 backdrop-blur">
              <label className="block">
                <span className="mb-3 block text-sm font-semibold text-gray-300">QR screenshot</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:rounded-xl file:border-0 file:bg-purple-600 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-white hover:file:bg-purple-500"
                />
              </label>

              {image && (
                <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3">
                  <img src={image} alt="Uploaded QR" className="mx-auto max-h-72 object-contain" />
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => image && decodeImage(image)}
                  disabled={!image || scanning}
                  className="flex-1 rounded-xl bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
                >
                  {scanning ? 'Scanning...' : 'Scan & Open'}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={!image && !result && !error}
                  className="rounded-xl border border-white/10 px-5 py-3 font-semibold text-gray-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            </section>

            {result && (
              <div className="mt-5 rounded-2xl border border-green-500/30 bg-green-500/10 p-4">
                <p className="font-bold text-green-200">QR found. Opening unlock page...</p>
                <p className="mt-2 break-all text-sm text-green-100/80">{result.url}</p>
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
                {error}
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-gray-400">
              <p className="font-semibold text-gray-200">Tips</p>
              <p className="mt-2">Use a clear screenshot where the QR code is fully visible, not cropped or blurred.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
