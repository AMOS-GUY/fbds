import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();
  const [msg, setMsg] = useState('Verifying...');
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setMsg('Invalid verification link'); return; }
    api.post('/auth/verify', { token })
      .then(res => {
        setMsg('✅ Email verified! Logging you in...');
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setTimeout(() => navigate('/'), 1500);
      })
      .catch(() => setMsg('❌ Invalid or expired token.'));
  }, [searchParams, navigate, setUser]);

  return <div className="text-center mt-10 text-xl">{msg}</div>;
};

export default VerifyEmail;