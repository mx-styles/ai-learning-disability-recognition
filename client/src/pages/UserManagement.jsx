import React, { useEffect, useMemo, useState } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const defaultForm = {
  username: '',
  full_name: '',
  password: '',
  role: 'teacher',
  is_active: true,
};

const UserManagement = () => {
  const { user, refreshUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.listUsers();
      setUsers(response.data.users || []);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setEditingUser(null);
    setFormData(defaultForm);
    setShowForm(true);
  };

  const openEditForm = (account) => {
    setEditingUser(account);
    setFormData({
      username: account.username || '',
      full_name: account.full_name || '',
      password: '',
      role: account.role || 'teacher',
      is_active: account.is_active ?? true,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData(defaultForm);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingUser) {
        const payload = {
          username: formData.username,
          full_name: formData.full_name,
          role: formData.role,
          is_active: formData.is_active,
        };

        if (formData.password) {
          payload.password = formData.password;
        }

        await authAPI.updateUser(editingUser.id, payload);
        setSuccess('User updated successfully');
      } else {
        await authAPI.createUser(formData);
        setSuccess('User created successfully');
      }

      closeForm();
      await loadUsers();
      await refreshUser();
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Failed to save user');
    }
  };

  const handleDelete = async (account) => {
    if (!window.confirm(`Delete ${account.full_name || account.username}?`)) {
      return;
    }

    setError('');
    setSuccess('');
    try {
      await authAPI.deleteUser(account.id);
      setSuccess('User deleted successfully');
      await loadUsers();
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Failed to delete user');
    }
  };

  const sortedUsers = useMemo(
    () => [...users].sort((left, right) => (left.username || '').localeCompare(right.username || '')),
    [users]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-600">Create and maintain staff accounts for secure system access.</p>
        </div>
        <button
          onClick={openCreateForm}
          className="w-full sm:w-auto rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700"
        >
          + Add User
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
      {success && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{success}</div>}

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="text-sm text-gray-600">Signed in as <span className="font-medium text-gray-900">{user?.full_name}</span></div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Login</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {sortedUsers.map((account) => (
                <tr key={account.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{account.full_name}</div>
                    <div className="text-xs text-gray-500">{account.username}</div>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-700">{account.role}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${account.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {account.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {account.last_login_at ? new Date(account.last_login_at).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button className="text-primary-600 hover:text-primary-800" onClick={() => openEditForm(account)}>
                      Edit
                    </button>
                    {account.id !== user?.id && (
                      <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(account)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-gray-900">{editingUser ? 'Edit User' : 'Create User'}</h3>
              <button onClick={closeForm} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleSave}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-1">
                  <span className="mb-1 block text-sm font-medium text-gray-700">Username</span>
                  <input
                    value={formData.username}
                    onChange={(event) => setFormData({ ...formData, username: event.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    required
                  />
                </label>
                <label className="block sm:col-span-1">
                  <span className="mb-1 block text-sm font-medium text-gray-700">Full Name</span>
                  <input
                    value={formData.full_name}
                    onChange={(event) => setFormData({ ...formData, full_name: event.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">Role</span>
                  <select
                    value={formData.role}
                    onChange={(event) => setFormData({ ...formData, role: event.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">Password {editingUser ? '(leave blank to keep)' : ''}</span>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    required={!editingUser}
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(event) => setFormData({ ...formData, is_active: event.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                Active account
              </label>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeForm} className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700">
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
