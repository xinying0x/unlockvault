import React from 'react';
import Head from 'next/head';

const VpnBlocked: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] text-white px-4">
      <Head>
        <title>تم حظر الوصول | UnlockVault</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="تم حظر الوصول بسبب استخدام VPN أو بروكسي. يرجى إيقافه وإعادة تحميل الصفحة." />
      </Head>
      <div className="w-full max-w-md bg-[#2a1a2e]/90 rounded-2xl shadow-2xl p-8 flex flex-col items-center border border-red-900">
        <div className="text-6xl mb-4 animate-pulse text-red-400">🚫</div>
        <h1 className="text-2xl md:text-3xl font-bold mb-3 text-center text-red-300">تم حظر الوصول</h1>
        <p className="text-base md:text-lg text-center text-orange-200 mb-8">
          يبدو أنك تستخدم VPN أو بروكسي. لأسباب أمنية، يرجى إيقافه وإعادة تحميل الصفحة.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-400 text-white font-bold rounded-xl shadow-lg hover:from-red-400 hover:to-orange-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 text-lg w-full"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
};

export default VpnBlocked; 