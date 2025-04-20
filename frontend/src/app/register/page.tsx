'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated blobs */}
      <div className="animated-blob w-[500px] h-[500px] left-[-200px] top-[10%]" style={{ animationDelay: "0s" }}></div>
      <div className="animated-blob w-[400px] h-[400px] right-[-100px] bottom-[10%]" style={{ animationDelay: "2s" }}></div>
      
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl backdrop-blur-sm bg-opacity-80 border border-gray-100 animate-fade-in">
        <div className="text-center">
          <Link href="/">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient inline-block mb-2">
              AutoDraft
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Demo Mode
          </h2>
        </div>
        
        <div className="text-center my-8">
          <p className="text-gray-600 mb-6">For this demo, all authentication is bypassed.</p>
          <button
            onClick={goToDashboard}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
          >
            Go to Dashboard
          </button>
        </div>

        <div className="text-center mt-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <span className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition">
              Sign in
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
} 