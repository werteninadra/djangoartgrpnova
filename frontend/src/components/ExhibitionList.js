import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ExhibitionList = () => {
  const { isAuthenticated, user } = useAuth();
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExhibitions();
  }, []);

  const fetchExhibitions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/expositions/', {
        withCredentials: true
      });
      // Ensure exhibitions is always an array
      const exhibitionsData = Array.isArray(response.data) ? response.data : [];
      setExhibitions(exhibitionsData);
    } catch (error) {
      console.error('Erreur lors du chargement des expositions:', error);
      setExhibitions([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Expositions Virtuelles</h1>
        {isAuthenticated && (user?.role === 'curator' || user?.role === 'admin') && (
          <Link to="/exhibitions/create" className="btn btn-primary">
            <i className="fas fa-plus"></i> Créer une Exposition
          </Link>
        )}
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {exhibitions.length > 0 ? exhibitions.map(exhibition => (
            <div key={exhibition.uuid} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{exhibition.title}</h5>
                  <p className="card-text flex-grow-1">
                    {exhibition.description || 'Découvrez cette exposition virtuelle unique.'}
                  </p>
                  <div className="mb-2">
                    <small className="text-muted">
                      Thème: {exhibition.theme} •
                      Statut: {exhibition.actif ? 'Active' : 'Inactive'}
                    </small>
                  </div>
                  <div className="d-flex gap-2">
                    <Link to={`/exhibitions/${exhibition.uuid}`} className="btn btn-primary flex-fill">
                      Explorer
                    </Link>
                    <Link to={`/exhibitions/${exhibition.uuid}/tour`} className="btn btn-outline-success">
                      <i className="fas fa-route"></i> Visite Virtuelle
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-12">
              <div className="alert alert-info text-center">
                <h4>Aucune exposition disponible</h4>
                <p>Il n'y a pas encore d'expositions virtuelles.</p>
                {isAuthenticated && (user?.role === 'curator' || user?.role === 'admin') ? (
                  <Link to="/exhibitions/create" className="btn btn-primary">Créer la première exposition</Link>
                ) : (
                  <p className="text-muted">Connectez-vous en tant que curateur pour créer des expositions.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExhibitionList;