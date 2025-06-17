import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../hooks/useAuth';
import AdminLayout from '../../../components/AdminLayout';

interface Tool {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  category: string;
  type: string;
  lockerLinks: { [key: string]: string };
  views: number;
  unlocks: number;
}

export default function DeleteTool() {
  const router = useRouter();
  const { slug } = router.query;
  const [tool, setTool] = useState<Tool | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/admin-xyz123/login');
    }
    if (slug) {
      fetchTool();
    }
  }, [slug, router, authLoading, user]);

  const fetchTool = async () => {
    try {
      const response = await fetch(`/api/tools/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setTool(data);
      } else {
        router.push('/admin-xyz123/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch tool:', error);
      router.push('/admin-xyz123/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!tool) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tools/${tool.slug}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        router.push('/admin-xyz123/dashboard');
      } else {
        alert('Failed to delete offer');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Error deleting tool:', error);
      alert('An error occurred');
      setIsDeleting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <AdminLayout title="Delete Offer">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-400">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!tool) {
    return (
      <AdminLayout title="Delete Offer">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-400">Tool not found</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Delete Offer">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-6 space-y-6 border border-gray-700">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4 text-white">Are you sure you want to delete this offer?</h2>
            <p className="text-gray-300 mb-6">This action cannot be undone.</p>
          </div>

          <div className="bg-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-4 mb-4">
              <img 
                src={tool.image} 
                alt={tool.title}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div>
                <h3 className="text-xl font-semibold text-white">{tool.title}</h3>
                <p className="text-gray-300">Type: {tool.type} | Category: {tool.category}</p>
                <p className="text-gray-400 text-sm">Views: {tool.views?.toLocaleString()} | Unlocks: {tool.unlocks?.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-gray-300">{tool.description}</p>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/admin-xyz123/dashboard')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl transition-colors"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-8 py-3 rounded-xl transition-colors font-medium disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 