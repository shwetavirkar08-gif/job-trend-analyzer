import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters.');
      }
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match.');
      }
      await signup(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold mb-4">Sign up</h1>
        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Name <span className="text-red-600">*</span></label>
            <input className="input-field" type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Email <span className="text-red-600">*</span></label>
            <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Password <span className="text-red-600">*</span></label>
            <input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required />
            <div className="text-xs text-gray-500 mt-1">Minimum 8 characters.</div>
          </div>
          <div>
            <label className="block text-sm mb-1">Confirm Password <span className="text-red-600">*</span></label>
            <input className="input-field" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={8} required />
          </div>
          <button className="btn-primary w-full" type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
        </form>
        <div className="text-sm text-gray-600 mt-3">Already have an account? <Link to="/login" className="text-primary-700">Log in</Link></div>
      </div>
    </div>
  );
};

export default Signup;


