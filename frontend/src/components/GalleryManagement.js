import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const GalleryManagement = () => {
  const { user } = useAuth();
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/galeries/', {
        withCredentials: true
      });
      // Ensure galleries is always an array
      const galleriesData = Array.isArray(response.data) ? response.data : [];
      setGalleries(galleriesData);
    } catch (error) {
      console.error('Erreur lors du chargement des galeries:', error);
      setGalleries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGallery = async (galleryId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette galerie ?')) {
      try {
        // Mock delete - replace with actual API call
        setGalleries(galleries.filter(g => g.id !== galleryId));
        alert('Galerie supprimée avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const filteredGalleries = galleries.filter(gallery =>
    gallery.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gallery.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gallery.ville.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gallery.pays.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <i className="fas fa-building me-2"></i>
          Gestion des Galeries
        </h1>
        <div>
          <Link to="/admin/dashboard" className="btn btn-outline-secondary me-2">
            <i className="fas fa-arrow-left me-2"></i>Retour au tableau de bord
          </Link>
          <Link to="/admin/galleries/create" className="btn btn-success">
            <i className="fas fa-plus me-2"></i>Créer une galerie
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher des galeries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-outline-secondary" type="button">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Galleries Grid */}
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {filteredGalleries.length > 0 ? filteredGalleries.map(gallery => (
            <div key={gallery.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{gallery.nom}</h5>
                  <p className="card-text flex-grow-1">{gallery.description}</p>
                  <div className="mb-2">
                    <small className="text-muted">
                      <i className="fas fa-map-marker-alt me-1"></i>
                      {gallery.adresse}, {gallery.ville}, {gallery.pays}
                    </small>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">
                      Gérant: {gallery.manager || 'Non assigné'}
                    </small>
                  </div>
                  <div className="d-flex gap-2">
                    <Link to={`/galleries/${gallery.id}`} className="btn btn-primary flex-fill">
                      Voir
                    </Link>
                    <Link to={`/admin/galleries/edit/${gallery.id}`} className="btn btn-warning">
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteGallery(gallery.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-12">
              <div className="alert alert-info text-center">
                <h4>Aucune galerie trouvée</h4>
                <p>
                  {searchQuery
                    ? `Aucune galerie ne correspond à "${searchQuery}".`
                    : "Il n'y a pas encore de galeries."
                  }
                </p>
                <Link to="/admin/galleries/create" className="btn btn-primary">
                  Créer la première galerie
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;