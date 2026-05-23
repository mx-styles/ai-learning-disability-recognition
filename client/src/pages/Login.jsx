import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
      <div className="w-full max-w-xl grid gap-6">
        <div className="rounded-3xl bg-gray-900 text-white shadow-xl p-8 lg:p-10">
          <h1 className="text-3xl font-bold tracking-tight text-white">Learning Disability Recognition System</h1>
          <h2 className="mt-4 text-2xl font-semibold">Sign in</h2>
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
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                placeholder="Enter your username"
                autoComplete="username"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-200">Password</span>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
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
