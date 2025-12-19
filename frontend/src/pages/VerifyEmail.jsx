import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../lib/api';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error, no-token
  const [message, setMessage] = useState('');
  const refreshUser = useAuthStore((state) => state.refreshUser);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('no-token');
      setMessage('No verification token provided.');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const response = await authAPI.verifyEmail(token);
      setStatus('success');
      setMessage(response.data.message || 'Your email has been verified successfully!');
      
      // Refresh user data to update emailVerified status
      if (refreshUser) {
        await refreshUser();
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Failed to verify email. The link may have expired.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden py-12">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10 mx-4 text-center">
        {/* Verifying State */}
        {status === 'verifying' && (
          <>
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Your Email</h1>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
          </>
        )}

        {/* Success State */}
        {status === 'success' && (
          <>
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-gray-500 text-sm mb-6">You can now upgrade your plan to access premium features.</p>
            <div className="space-y-3">
              <Link
                to="/upgrade"
                className="block w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition shadow-lg shadow-orange-500/30"
              >
                Upgrade Your Plan
              </Link>
              <Link
                to="/dashboard"
                className="block w-full bg-gray-100 text-gray-900 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Go to Dashboard
              </Link>
            </div>
          </>
        )}

        {/* Error State */}
        {status === 'error' && (
          <>
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                to="/dashboard"
                className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition"
              >
                Go to Dashboard
              </Link>
              <p className="text-gray-500 text-sm">
                You can request a new verification email from your dashboard.
              </p>
            </div>
          </>
        )}

        {/* No Token State */}
        {status === 'no-token' && (
          <>
            <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-10 w-10 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                to="/dashboard"
                className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition"
              >
                Go to Dashboard
              </Link>
              <p className="text-gray-500 text-sm">
                Request a new verification email from your upgrade page.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
