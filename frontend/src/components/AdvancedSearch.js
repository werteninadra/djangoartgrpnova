import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdvancedSearch = () => {
  const [filters, setFilters] = useState({
    q: '',
    style: '',
    theme: '',
    couleur_principale: '',
    artiste: '',
    date_min: '',
    date_max: '',
    tags: '',
    min_views: '',
    max_views: ''
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = () => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(history.slice(0, 5)); // Keep last 5 searches
  };

  const saveSearchToHistory = (searchFilters) => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const newHistory = [searchFilters, ...history.filter(h => JSON.stringify(h) !== JSON.stringify(searchFilters))].slice(0, 5);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    setSearchHistory(newHistory);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const performSearch = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(`http://127.0.0.1:8000/catalogue/advanced-search/?${params}`);
      setResults(response.data.oeuvres || []);

      // Save search to history
      saveSearchToHistory(filters);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      q: '',
      style: '',
      theme: '',
      couleur_principale: '',
      artiste: '',
      date_min: '',
      date_max: '',
      tags: '',
      min_views: '',
      max_views: ''
    });
    setResults([]);
  };

  const loadFromHistory = (historyItem) => {
    setFilters(historyItem);
    performSearch();
  };

  const clearHistory = () => {
    localStorage.removeItem('searchHistory');
    setSearchHistory([]);
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-4">
          {/* Advanced Search Filters */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="mb-0">Recherche Avancée</h3>
            </div>
            <div className="card-body">
              <form onSubmit={(e) => { e.preventDefault(); performSearch(); }}>
                {/* Basic Search */}
                <div className="mb-3">
                  <label className="form-label">Recherche générale</label>
                  <input
                    type="text"
                    name="q"
                    className="form-control"
                    placeholder="Titre, description..."
                    value={filters.q}
                    onChange={handleFilterChange}
                  />
                </div>

                {/* Style and Theme */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Style</label>
                    <select
                      name="style"
                      className="form-select"
                      value={filters.style}
                      onChange={handleFilterChange}
                    >
                      <option value="">Tous les styles</option>
                      <option value="Abstract">Abstrait</option>
                      <option value="Geometric">Géométrique</option>
                      <option value="Organic">Organique</option>
                      <option value="Minimalist">Minimaliste</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Thème</label>
                    <select
                      name="theme"
                      className="form-select"
                      value={filters.theme}
                      onChange={handleFilterChange}
                    >
                      <option value="">Tous les thèmes</option>
                      <option value="Nature">Nature</option>
                      <option value="Cosmic">Cosmique</option>
                      <option value="Urban">Urbain</option>
                      <option value="Abstract">Abstrait</option>
                    </select>
                  </div>
                </div>

                {/* Color */}
                <div className="mb-3">
                  <label className="form-label">Couleur principale</label>
                  <select
                    name="couleur_principale"
                    className="form-select"
                    value={filters.couleur_principale}
                    onChange={handleFilterChange}
                  >
                    <option value="">Toutes les couleurs</option>
                    <option value="Rouge">Rouge</option>
                    <option value="Bleu">Bleu</option>
                    <option value="Vert">Vert</option>
                    <option value="Jaune">Jaune</option>
                    <option value="Violet">Violet</option>
                    <option value="Orange">Orange</option>
                    <option value="Rose">Rose</option>
                    <option value="Noir">Noir</option>
                    <option value="Blanc">Blanc</option>
                  </select>
                </div>

                {/* Artist */}
                <div className="mb-3">
                  <label className="form-label">Artiste</label>
                  <input
                    type="text"
                    name="artiste"
                    className="form-control"
                    placeholder="Nom de l'artiste"
                    value={filters.artiste}
                    onChange={handleFilterChange}
                  />
                </div>

                {/* Date Range */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Date min</label>
                    <input
                      type="date"
                      name="date_min"
                      className="form-control"
                      value={filters.date_min}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Date max</label>
                    <input
                      type="date"
                      name="date_max"
                      className="form-control"
                      value={filters.date_max}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-3">
                  <label className="form-label">Tags (séparés par des virgules)</label>
                  <input
                    type="text"
                    name="tags"
                    className="form-control"
                    placeholder="tag1, tag2, tag3"
                    value={filters.tags}
                    onChange={handleFilterChange}
                  />
                </div>

                {/* View Count Range */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Vues min</label>
                    <input
                      type="number"
                      name="min_views"
                      className="form-control"
                      placeholder="0"
                      value={filters.min_views}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Vues max</label>
                    <input
                      type="number"
                      name="max_views"
                      className="form-control"
                      placeholder="1000"
                      value={filters.max_views}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Recherche...' : 'Rechercher'}
                  </button>
                  <button type="button" onClick={resetFilters} className="btn btn-outline-secondary">
                    Réinitialiser
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Historique des recherches</h5>
                <button onClick={clearHistory} className="btn btn-sm btn-outline-danger">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
              <div className="card-body">
                {searchHistory.map((historyItem, index) => (
                  <div key={index} className="mb-2">
                    <button
                      onClick={() => loadFromHistory(historyItem)}
                      className="btn btn-outline-secondary btn-sm w-100 text-start"
                    >
                      {historyItem.q || `${historyItem.style || 'Tous styles'} - ${historyItem.theme || 'Tous thèmes'}`}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-lg-8">
          {/* Search Results */}
          <div className="card">
            <div className="card-header">
              <h3 className="mb-0">Résultats ({results.length})</h3>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              ) : results.length > 0 ? (
                <div className="row">
                  {results.map(oeuvre => (
                    <div key={oeuvre.id} className="col-md-6 col-lg-4 mb-4">
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
                          <h6 className="card-title">{oeuvre.titre}</h6>
                          <p className="card-text small flex-grow-1">{oeuvre.description}</p>
                          <div className="mb-2">
                            <small className="text-muted">
                              {oeuvre.style} • {oeuvre.theme} • {oeuvre.couleur_principale}
                            </small>
                          </div>
                          <Link to={`/oeuvre/${oeuvre.id}`} className="btn btn-primary btn-sm mt-auto">
                            Voir Détails
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info text-center">
                  <h4>Aucun résultat</h4>
                  <p>Ajustez vos critères de recherche pour trouver des œuvres.</p>
                  <Link to="/catalogue" className="btn btn-primary">Voir tout le catalogue</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;