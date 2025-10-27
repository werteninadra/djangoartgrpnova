import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Catalogue = () => {
  const [oeuvres, setOeuvres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    q: '',
    style: '',
    theme: '',
    tag: ''
  });

  useEffect(() => {
    fetchOeuvres();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOeuvres = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const response = await axios.get(`http://127.0.0.1:8000/catalogue/oeuvres/?${params}`, {
        withCredentials: true
      });
      // Handle different response formats
      if (response.data.oeuvres) {
        setOeuvres(response.data.oeuvres);
      } else if (Array.isArray(response.data)) {
        setOeuvres(response.data);
      } else {
        setOeuvres([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des œuvres:', error);
      setOeuvres([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      q: '',
      style: '',
      theme: '',
      tag: ''
    });
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Catalogue des Œuvres d'Art</h1>

      {/* Search and Filter Form */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <input
                type="text"
                name="q"
                className="form-control"
                placeholder="Rechercher..."
                value={filters.q}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-2">
              <input
                type="text"
                name="style"
                className="form-control"
                placeholder="Style"
                value={filters.style}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-2">
              <input
                type="text"
                name="theme"
                className="form-control"
                placeholder="Thème"
                value={filters.theme}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-2">
              <input
                type="text"
                name="tag"
                className="form-control"
                placeholder="Tag"
                value={filters.tag}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-3">
              <button onClick={fetchOeuvres} className="btn btn-primary me-2">Filtrer</button>
              <button onClick={resetFilters} className="btn btn-outline-secondary">Réinitialiser</button>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Art Button */}
      <div className="mb-4">
        <Link to="/generer" className="btn btn-success">🎨 Générer une Nouvelle Œuvre d'Art</Link>
        <Link to="/catalogue/search" className="btn btn-outline-primary ms-2">🔍 Recherche Avancée</Link>
        <Link to="/profil" className="btn btn-outline-info ms-2">Mon Profil</Link>
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
          {oeuvres.length > 0 ? oeuvres.map(oeuvre => (
            <div key={oeuvre.id} className="col-md-4 mb-4">
              <div className="card h-100">
                {oeuvre.image && (
                  <img
                    src={`http://127.0.0.1:8000${oeuvre.image}`}
                    className="card-img-top"
                    alt={oeuvre.titre}
                    style={{height: '200px', objectFit: 'cover'}}
                  />
                )}
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{oeuvre.titre}</h5>
                  <p className="card-text flex-grow-1">{oeuvre.description}</p>
                  <div className="mb-2">
                    <small className="text-muted">
                      <strong>Style:</strong> {oeuvre.style} |
                      <strong>Thème:</strong> {oeuvre.theme} |
                      <strong>Couleur:</strong> {oeuvre.couleur_principale}
                    </small>
                  </div>
                  <div className="mb-2">
                    {oeuvre.tags && oeuvre.tags.length > 0 ? oeuvre.tags.map(tag => (
                      <span key={tag.id} className="badge bg-secondary me-1">{tag.nom}</span>
                    )) : (
                      <span className="text-muted">Aucun tag</span>
                    )}
                  </div>
                  <Link to={`/oeuvre/${oeuvre.id}`} className="btn btn-primary mt-auto">
                    Voir Détails
                  </Link>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-12">
              <div className="alert alert-info text-center">
                <h4>Aucune œuvre disponible</h4>
                <p>Il n'y a pas encore d'œuvres dans le catalogue.</p>
                <Link to="/generer" className="btn btn-primary">Créer la première œuvre</Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Catalogue;