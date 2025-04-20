'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { register } = useAuth();
  const router = useRouter();

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  const nextStep = () => {
    if (currentStep === 1 && (!name || !email)) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (currentStep === 2) {
      if (!password || !confirmPassword) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      
      if (passwordStrength < 3) {
        toast.error('Please use a stronger password');
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(name, email, password, orgName);
      toast.success('Registration successful!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Create your account
          </h2>
          
          {/* Step indicator */}
          <div className="flex justify-center items-center mb-8">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${currentStep === 1 ? 'bg-indigo-600 scale-125' : 'bg-gray-300'}`}></div>
            <div className={`h-0.5 w-8 ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${currentStep === 2 ? 'bg-indigo-600 scale-125' : currentStep > 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            <div className={`h-0.5 w-8 ${currentStep >= 3 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${currentStep === 3 ? 'bg-indigo-600 scale-125' : 'bg-gray-300'}`}></div>
          </div>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Step 1: Basic Info */}
          <div className={`space-y-4 transition-all duration-500 ${currentStep === 1 ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          {/* Step 2: Password */}
          <div className={`space-y-4 transition-all duration-500 ${currentStep === 2 ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
              />
              
              {/* Password strength meter */}
              <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    passwordStrength === 0 ? 'w-0' :
                    passwordStrength === 1 ? 'w-1/4 bg-red-500' :
                    passwordStrength === 2 ? 'w-2/4 bg-yellow-500' :
                    passwordStrength === 3 ? 'w-3/4 bg-blue-500' :
                    'w-full bg-green-500'
                  }`}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password should be at least 8 characters with uppercase, numbers, and special characters
              </p>
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          
          {/* Step 3: Organization */}
          <div className={`space-y-4 transition-all duration-500 ${currentStep === 3 ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name
              </label>
              <input
                id="organization"
                name="organization"
                type="text"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Your Organization (Optional)"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <Link href="/terms" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white border-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover-lift"
              >
                Back
              </button>
            )}
            
            <div className="flex-grow"></div>
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover-lift"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover-lift"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            )}
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all hover-lift"
            >
              <svg className="w-5 h-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                  clipRule="evenodd"
                />
              </svg>
              GitHub
            </button>

            <button
              type="button"
              className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all hover-lift"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              Google
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
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