import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import axios from 'axios';
import { fetchCurrentUser } from '../../api/graphql';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Appel à l'API de login
      const loginResponse = await axios.post('https://www.chifaa.sn/pharma_back_test/api/login', {
        email,
        password
      });

      console.log('Réponse login:', loginResponse.data); // Pour debug

      // Si le statut est 201, on considère que c'est un succès
      if (loginResponse.status === 201) {
        // Sauvegarde du token (ajustez selon la structure réelle de votre réponse)
        const token = loginResponse.data.token || loginResponse.data.access_token;
        if (!token) {
          console.error('Token non trouvé dans la réponse:', loginResponse.data);
          throw new Error('Token non trouvé dans la réponse');
        }
        
        localStorage.setItem('authToken', token);
        
        // Récupération des infos utilisateur
        const user = await fetchCurrentUser();
        onLoginSuccess(user);
        navigate('/dashboard');
      } else {
        throw new Error(loginResponse.data.message || 'Échec de la connexion');
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Échec de la connexion. Vérifiez vos identifiants.');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card sketch">
        <h1 className="login-title">Connexion</h1>
        <p className="login-sub">Accédez à votre espace administratif</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre.email@exemple.com"
            required
          />

          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <div className="actions">
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>

          {error && <div className="login-error">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default Login;
