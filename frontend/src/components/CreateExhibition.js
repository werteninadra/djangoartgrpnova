import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const CreateExhibition = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    theme: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.titre.trim()) newErrors.titre = 'Le titre de l\'exposition est requis';
    if (!formData.theme.trim()) newErrors.theme = 'Le thème est requis';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://127.0.0.1:8000/expositions/ajouter/', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      alert('Exposition créée avec succès!');
      navigate('/admin/exhibitions');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création de l\'exposition: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          Accès refusé. Vous devez être administrateur pour accéder à cette page.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          <i className="fas fa-plus me-2"></i>
          Créer une Nouvelle Exposition
        </h1>
        <Link to="/admin/exhibitions" className="btn btn-outline-secondary">
          <i className="fas fa-arrow-left me-2"></i>Retour à la liste
        </Link>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="titre" className="form-label">
                    <i className="fas fa-heading me-2"></i>
                    Titre de l'Exposition *
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.titre ? 'is-invalid' : ''}`}
                    id="titre"
                    name="titre"
                    value={formData.titre}
                    onChange={handleChange}
                    placeholder="Entrez le titre de l'exposition"
                    required
                  />
                  {errors.titre && <div className="invalid-feedback">{errors.titre}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    <i className="fas fa-align-left me-2"></i>
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Décrivez l'exposition..."
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="theme" className="form-label">
                    <i className="fas fa-palette me-2"></i>
                    Thème *
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.theme ? 'is-invalid' : ''}`}
                    id="theme"
                    name="theme"
                    value={formData.theme}
                    onChange={handleChange}
                    placeholder="Ex: Art Moderne, Nature, Abstrait..."
                    required
                  />
                  {errors.theme && <div className="invalid-feedback">{errors.theme}</div>}
                </div>

                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="is_active">
                      <i className="fas fa-toggle-on me-2"></i>
                      Exposition active (visible pour les visiteurs)
                    </label>
                  </div>
                  <small className="form-text text-muted">
                    Désactivez cette option pour masquer l'exposition temporairement
                  </small>
                </div>

                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Note:</strong> Après la création, vous pourrez ajouter des œuvres à cette exposition
                  depuis la page de gestion des expositions.
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <Link to="/admin/exhibitions" className="btn btn-outline-secondary me-md-2">
                    Annuler
                  </Link>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Création...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus me-2"></i>
                        Créer l'Exposition
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateExhibition;