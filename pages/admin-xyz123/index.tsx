import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminIndex() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin !== 'true') {
      router.replace('/admin-xyz123/login');
    } else {
      // Redirect to dashboard if authenticated
      router.replace('/admin-xyz123/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-xl text-gray-400">Redirecting...</div>
    </div>
  );
} 