import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GalleryList = () => {
  const { isAuthenticated, user } = useAuth();
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
      setGalleries([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filteredGalleries = galleries.filter(gallery =>
    gallery.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gallery.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Galeries</h1>
        {isAuthenticated && (user?.role === 'curator' || user?.role === 'admin') && (
          <Link to="/galleries/create" className="btn btn-primary">
            <i className="fas fa-plus"></i> Créer une Galerie
          </Link>
        )}
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
                  <h5 className="card-title">{gallery.name}</h5>
                  <p className="card-text flex-grow-1">{gallery.description}</p>
                  <div className="mb-2">
                    <small className="text-muted">
                      {gallery.collections ? `${gallery.collections.length} collections` : 'Aucune collection'} •
                      {gallery.rooms ? `${gallery.rooms.length} salles` : 'Aucune salle'}
                    </small>
                  </div>
                  <div className="d-flex gap-2">
                    <Link to={`/galleries/${gallery.id}`} className="btn btn-primary flex-fill">
                      Explorer
                    </Link>
                    <Link to={`/galleries/${gallery.id}/virtual`} className="btn btn-outline-success">
                      <i className="fas fa-vr-cardboard"></i> Visite Virtuelle
                    </Link>
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
                {!searchQuery && isAuthenticated && (user?.role === 'curator' || user?.role === 'admin') && (
                  <Link to="/galleries/create" className="btn btn-primary">Créer la première galerie</Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GalleryList;