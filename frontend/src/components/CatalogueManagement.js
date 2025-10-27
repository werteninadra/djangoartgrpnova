import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const CatalogueManagement = () => {
  const { user } = useAuth();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockArtworks = [];
      setArtworks(mockArtworks);
    } catch (error) {
      console.error('Erreur lors du chargement des œuvres:', error);
      setArtworks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArtwork = async (artworkId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette œuvre ?')) {
      try {
        // Mock delete - replace with actual API call
        setArtworks(artworks.filter(a => a.id !== artworkId));
        alert('Œuvre supprimée avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const filteredArtworks = artworks.filter(artwork =>
    artwork.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artwork.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artwork.style.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artwork.theme.toLowerCase().includes(searchQuery.toLowerCase())
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
          <i className="fas fa-palette me-2"></i>
          Gestion du Catalogue
        </h1>
        <div>
          <Link to="/admin/dashboard" className="btn btn-outline-secondary me-2">
            <i className="fas fa-arrow-left me-2"></i>Retour au tableau de bord
          </Link>
          <Link to="/admin/catalogue/create" className="btn btn-success">
            <i className="fas fa-plus me-2"></i>Ajouter une œuvre
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
              placeholder="Rechercher des œuvres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-outline-secondary" type="button">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Artworks Grid */}
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {filteredArtworks.length > 0 ? filteredArtworks.map(artwork => (
            <div key={artwork.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                {artwork.image && (
                  <img
                    src={`http://127.0.0.1:8000${artwork.image}`}
                    className="card-img-top"
                    alt={artwork.titre}
                    style={{height: '200px', objectFit: 'cover'}}
                  />
                )}
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{artwork.titre}</h5>
                  <p className="card-text flex-grow-1">{artwork.description}</p>
                  <div className="mb-2">
                    <small className="text-muted">
                      <strong>Style:</strong> {artwork.style} |
                      <strong>Thème:</strong> {artwork.theme} |
                      <strong>Couleur:</strong> {artwork.couleur_principale}
                    </small>
                  </div>
                  <div className="mb-2">
                    {artwork.tags && artwork.tags.length > 0 ? artwork.tags.map(tag => (
                      <span key={tag.id} className="badge bg-secondary me-1">{tag.nom}</span>
                    )) : (
                      <span className="text-muted">Aucun tag</span>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    <Link to={`/oeuvre/${artwork.id}`} className="btn btn-primary flex-fill">
                      Voir
                    </Link>
                    <Link to={`/admin/catalogue/edit/${artwork.id}`} className="btn btn-warning">
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteArtwork(artwork.id)}
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
                <h4>Aucune œuvre trouvée</h4>
                <p>
                  {searchQuery
                    ? `Aucune œuvre ne correspond à "${searchQuery}".`
                    : "Il n'y a pas encore d'œuvres dans le catalogue."
                  }
                </p>
                <div className="mt-3">
                  <Link to="/generer" className="btn btn-success me-2">
                    <i className="fas fa-magic me-2"></i>Générer une œuvre IA
                  </Link>
                  <Link to="/admin/catalogue/create" className="btn btn-primary">
                    <i className="fas fa-plus me-2"></i>Ajouter manuellement
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CatalogueManagement;