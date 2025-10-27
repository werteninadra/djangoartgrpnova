import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const ExhibitionManagement = () => {
  const { user } = useAuth();
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchExhibitions();
  }, []);

  const fetchExhibitions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/virtual-exhibitions/', {
        withCredentials: true
      });
      // Ensure exhibitions is always an array
      const exhibitionsData = Array.isArray(response.data) ? response.data : [];
      setExhibitions(exhibitionsData);
    } catch (error) {
      console.error('Erreur lors du chargement des expositions:', error);
      setExhibitions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExhibition = async (exhibitionId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette exposition ?')) {
      try {
        // Mock delete - replace with actual API call
        setExhibitions(exhibitions.filter(e => e.id !== exhibitionId));
        alert('Exposition supprimée avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const filteredExhibitions = exhibitions.filter(exhibition =>
    exhibition.titre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exhibition.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exhibition.theme?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <i className="fas fa-calendar-alt me-2"></i>
          Gestion des Expositions
        </h1>
        <div>
          <Link to="/admin/dashboard" className="btn btn-outline-secondary me-2">
            <i className="fas fa-arrow-left me-2"></i>Retour au tableau de bord
          </Link>
          <Link to="/admin/exhibitions/create" className="btn btn-success">
            <i className="fas fa-plus me-2"></i>Créer une exposition
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
              placeholder="Rechercher des expositions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-outline-secondary" type="button">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Exhibitions Grid */}
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {filteredExhibitions.length > 0 ? filteredExhibitions.map(exhibition => (
            <div key={exhibition.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{exhibition.titre || 'Sans titre'}</h5>
                  <p className="card-text flex-grow-1">
                    {exhibition.description || 'Aucune description'}
                  </p>
                  <div className="mb-2">
                    <small className="text-muted">
                      <strong>Thème:</strong> {exhibition.theme || 'Non spécifié'} |
                      <strong>Statut:</strong> {exhibition.is_active ? 'Active' : 'Inactive'}
                    </small>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">
                      <strong>Œuvres:</strong> {exhibition.oeuvres?.length || 0}
                    </small>
                  </div>
                  <div className="d-flex gap-2">
                    <Link to={`/virtual-exhibitions/${exhibition.id}`} className="btn btn-primary flex-fill">
                      Voir
                    </Link>
                    <Link to={`/admin/exhibitions/edit/${exhibition.id}`} className="btn btn-warning">
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteExhibition(exhibition.id)}
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
                <h4>Aucune exposition trouvée</h4>
                <p>
                  {searchQuery
                    ? `Aucune exposition ne correspond à "${searchQuery}".`
                    : "Il n'y a pas encore d'expositions."
                  }
                </p>
                <Link to="/admin/exhibitions/create" className="btn btn-primary">
                  Créer la première exposition
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExhibitionManagement;