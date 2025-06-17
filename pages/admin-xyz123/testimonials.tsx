import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import { useToast } from '../../components/ToastProvider';

interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  avatar: string;
  createdAt: string;
  status: 'active' | 'pending' | 'rejected';
}

const AdminTestimonialsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    if (!router.isReady) return;
    if (!loading && !user) {
      router.push('/admin-xyz123/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchTestimonials();
    }
  }, [user]);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/testimonials'); // Admin API for all testimonials
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      } else {
        const errorData = await response.json();
        addToast({
          type: 'error',
          title: 'Error',
          message: errorData.message || 'Failed to fetch testimonials',
        });
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'An unexpected error occurred while fetching testimonials.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTestimonialStatus = async (id: string, newStatus: Testimonial['status']) => {
    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Success',
          message: `Testimonial ${newStatus}ed successfully.`,
        });
        fetchTestimonials(); // Refresh list
      } else {
        const errorData = await response.json();
        addToast({
          type: 'error',
          title: 'Error',
          message: errorData.message || 'Failed to update testimonial status.',
        });
      }
    } catch (error) {
      console.error('Error updating testimonial status:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'An unexpected error occurred while updating status.',
      });
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Testimonial deleted successfully.',
        });
        fetchTestimonials(); // Refresh list
      } else {
        const errorData = await response.json();
        addToast({
          type: 'error',
          title: 'Error',
          message: errorData.message || 'Failed to delete testimonial.',
        });
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'An unexpected error occurred while deleting testimonial.',
      });
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">Loading Testimonials...</h2>
          <p className="text-gray-400">Please wait...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Should redirect via useEffect
  }

  return (
    <AdminLayout title="Manage Testimonials">
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-white mb-6">Manage Testimonials</h1>
        
        {testimonials.length === 0 ? (
          <p className="text-gray-400">No testimonials found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-[#2D1B5A]/50 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-purple-900/30 text-white">
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-3">{testimonial.avatar}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-gray-400">Rating: {testimonial.rating}/5</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-4 line-clamp-3">{testimonial.text}</p>
                <p className="text-xs text-gray-500 mb-4">Created: {new Date(testimonial.createdAt).toLocaleDateString()}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    testimonial.status === 'active' ? 'bg-green-600/20 text-green-300' :
                    testimonial.status === 'pending' ? 'bg-yellow-600/20 text-yellow-300' :
                    'bg-red-600/20 text-red-300'
                  }`}>
                    {testimonial.status}
                  </span>
                  <div className="flex gap-2">
                    {testimonial.status !== 'active' && (
                      <button
                        onClick={() => updateTestimonialStatus(testimonial.id, 'active')}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    {testimonial.status !== 'rejected' && (
                      <button
                        onClick={() => updateTestimonialStatus(testimonial.id, 'rejected')}
                        className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm transition-colors"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => deleteTestimonial(testimonial.id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTestimonialsPage; 