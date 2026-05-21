import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [loading, isAuthenticated, navigate, from]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (loginError) {
      setError(loginError.response?.data?.error || 'Unable to sign in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl bg-white/90 backdrop-blur shadow-xl border border-white p-8 lg:p-10 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
              Secure Offline Access
            </div>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900">
              Learning Disability Screening System
            </h1>
            <p className="mt-4 text-base text-gray-600 max-w-xl">
              Sign in to manage student assessments, review results, and administer users from a single local dashboard.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ['Offline', 'All data stays on the local machine'],
              ['Protected', 'Token-based access for staff accounts'],
              ['Managed', 'Admin users can create and edit accounts'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <div className="text-sm font-semibold text-gray-900">{title}</div>
                <div className="mt-1 text-sm text-gray-600">{description}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-gray-900 text-white shadow-xl p-8 lg:p-10">
          <h2 className="text-2xl font-semibold">Sign in</h2>
          <p className="mt-2 text-sm text-gray-300">
            Use your staff account to access the dashboard and manage student assessments.
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-200">Username</span>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                placeholder="Enter your username"
                autoComplete="username"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-200">Password</span>
              <input
                type="password"
                className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-primary-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
