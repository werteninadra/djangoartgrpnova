import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/profil';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.username, formData.password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError(error.response?.data?.error || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-header bg-primary text-white text-center">
              <h3 className="mb-0">
                <i className="fas fa-sign-in-alt me-2"></i>
                Connexion
              </h3>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    <i className="fas fa-user me-2"></i>
                    Nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    <i className="fas fa-lock me-2"></i>
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Connexion...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Se connecter
                      </>
                    )}
                  </button>
                </div>
              </form>

              <hr className="my-4" />

              <div className="text-center">
                <p className="mb-2">Pas encore de compte ?</p>
                <Link to="/register" className="btn btn-outline-primary">
                  <i className="fas fa-user-plus me-2"></i>
                  S'inscrire
                </Link>
              </div>

              <div className="text-center mt-3">
                <Link to="/forgot-password" className="text-muted">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="card mt-3 border-warning">
            <div className="card-body">
              <h6 className="card-title text-warning">
                <i className="fas fa-info-circle me-2"></i>
                Identifiants de démonstration
              </h6>
              <small className="text-muted">
                Pour tester l'application, utilisez ces identifiants temporaires.
                En production, cette section sera supprimée.
              </small>
              <div className="mt-2">
                <strong>Admin:</strong> admin<br />
                <strong>Mot de passe:</strong> admin123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;