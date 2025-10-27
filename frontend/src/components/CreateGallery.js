import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const CreateGallery = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    adresse: '',
    ville: '',
    pays: '',
    manager: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    if (!formData.nom.trim()) newErrors.nom = 'Le nom de la galerie est requis';
    if (!formData.ville.trim()) newErrors.ville = 'La ville est requise';
    if (!formData.pays.trim()) newErrors.pays = 'Le pays est requis';

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
      const response = await axios.post('http://127.0.0.1:8000/galeries/ajouter/', {
        name: formData.nom,
        description: formData.description,
        manager: formData.manager || null
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      alert('Galerie créée avec succès!');
      navigate('/admin/galleries');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création de la galerie: ' + (error.response?.data?.error || error.message));
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
          Créer une Nouvelle Galerie
        </h1>
        <Link to="/admin/galleries" className="btn btn-outline-secondary">
          <i className="fas fa-arrow-left me-2"></i>Retour à la liste
        </Link>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="nom" className="form-label">
                    <i className="fas fa-building me-2"></i>
                    Nom de la Galerie *
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.nom ? 'is-invalid' : ''}`}
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Entrez le nom de la galerie"
                    required
                  />
                  {errors.nom && <div className="invalid-feedback">{errors.nom}</div>}
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
                    placeholder="Décrivez la galerie..."
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="adresse" className="form-label">
                      <i className="fas fa-map-marker-alt me-2"></i>
                      Adresse
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="adresse"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleChange}
                      placeholder="Numéro et rue"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="ville" className="form-label">
                      <i className="fas fa-city me-2"></i>
                      Ville *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.ville ? 'is-invalid' : ''}`}
                      id="ville"
                      name="ville"
                      value={formData.ville}
                      onChange={handleChange}
                      placeholder="Ville"
                      required
                    />
                    {errors.ville && <div className="invalid-feedback">{errors.ville}</div>}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="pays" className="form-label">
                      <i className="fas fa-globe me-2"></i>
                      Pays *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.pays ? 'is-invalid' : ''}`}
                      id="pays"
                      name="pays"
                      value={formData.pays}
                      onChange={handleChange}
                      placeholder="Pays"
                      required
                    />
                    {errors.pays && <div className="invalid-feedback">{errors.pays}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="manager" className="form-label">
                      <i className="fas fa-user-tie me-2"></i>
                      Gérant
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="manager"
                      name="manager"
                      value={formData.manager}
                      onChange={handleChange}
                      placeholder="Nom du gérant (optionnel)"
                    />
                  </div>
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <Link to="/admin/galleries" className="btn btn-outline-secondary me-md-2">
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
                        Créer la Galerie
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

export default CreateGallery;