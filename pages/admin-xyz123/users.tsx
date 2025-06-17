import React from 'react';
import AdminLayout from '../../components/AdminLayout';

const UsersPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Admin Users</h2>
        <p className="text-gray-300 text-lg">Only one admin user exists for this site.</p>
      </div>
    </div>
  );
};

export default UsersPage;
