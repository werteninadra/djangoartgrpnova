import React from 'react';

const ArtworkFilters = ({ filters, onFilterChange, onReset, loading }) => {
  const styleOptions = [
    { value: '', label: 'Tous les styles' },
    { value: 'Abstract', label: 'Abstrait' },
    { value: 'Geometric', label: 'Géométrique' },
    { value: 'Organic', label: 'Organique' },
    { value: 'Minimalist', label: 'Minimaliste' },
    { value: 'Expressionist', label: 'Expressionniste' },
    { value: 'Surrealist', label: 'Surréaliste' }
  ];

  const themeOptions = [
    { value: '', label: 'Tous les thèmes' },
    { value: 'Nature', label: 'Nature' },
    { value: 'Cosmic', label: 'Cosmique' },
    { value: 'Urban', label: 'Urbain' },
    { value: 'Abstract', label: 'Abstrait' },
    { value: 'Emotional', label: 'Émotionnel' },
    { value: 'Spiritual', label: 'Spirituel' }
  ];

  const colorOptions = [
    { value: '', label: 'Toutes les couleurs' },
    { value: 'Rouge', label: 'Rouge' },
    { value: 'Bleu', label: 'Bleu' },
    { value: 'Vert', label: 'Vert' },
    { value: 'Jaune', label: 'Jaune' },
    { value: 'Violet', label: 'Violet' },
    { value: 'Orange', label: 'Orange' },
    { value: 'Rose', label: 'Rose' },
    { value: 'Noir', label: 'Noir' },
    { value: 'Blanc', label: 'Blanc' },
    { value: 'Gris', label: 'Gris' },
    { value: 'Marron', label: 'Marron' }
  ];

  const sortOptions = [
    { value: 'date_desc', label: 'Plus récent' },
    { value: 'date_asc', label: 'Plus ancien' },
    { value: 'title_asc', label: 'Titre A-Z' },
    { value: 'title_desc', label: 'Titre Z-A' },
    { value: 'views_desc', label: 'Plus populaire' },
    { value: 'random', label: 'Aléatoire' }
  ];

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="mb-0 d-flex justify-content-between align-items-center">
          Filtres et Tri
          <button onClick={onReset} className="btn btn-outline-secondary btn-sm">
            <i className="fas fa-undo"></i> Réinitialiser
          </button>
        </h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          {/* Search Input */}
          <div className="col-md-6">
            <label className="form-label">Recherche</label>
            <div className="input-group">
              <input
                type="text"
                name="q"
                className="form-control"
                placeholder="Titre, description, artiste..."
                value={filters.q || ''}
                onChange={onFilterChange}
                disabled={loading}
              />
              <button className="btn btn-outline-secondary" type="button" disabled={loading}>
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>

          {/* Sort */}
          <div className="col-md-6">
            <label className="form-label">Trier par</label>
            <select
              name="sort"
              className="form-select"
              value={filters.sort || ''}
              onChange={onFilterChange}
              disabled={loading}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Style Filter */}
          <div className="col-md-4">
            <label className="form-label">Style</label>
            <select
              name="style"
              className="form-select"
              value={filters.style || ''}
              onChange={onFilterChange}
              disabled={loading}
            >
              {styleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Filter */}
          <div className="col-md-4">
            <label className="form-label">Thème</label>
            <select
              name="theme"
              className="form-select"
              value={filters.theme || ''}
              onChange={onFilterChange}
              disabled={loading}
            >
              {themeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Color Filter */}
          <div className="col-md-4">
            <label className="form-label">Couleur principale</label>
            <select
              name="couleur_principale"
              className="form-select"
              value={filters.couleur_principale || ''}
              onChange={onFilterChange}
              disabled={loading}
            >
              {colorOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tags Filter */}
          <div className="col-md-6">
            <label className="form-label">Tags</label>
            <input
              type="text"
              name="tags"
              className="form-control"
              placeholder="tag1, tag2, tag3"
              value={filters.tags || ''}
              onChange={onFilterChange}
              disabled={loading}
            />
            <div className="form-text">
              Séparez les tags par des virgules
            </div>
          </div>

          {/* Artist Filter */}
          <div className="col-md-6">
            <label className="form-label">Artiste</label>
            <input
              type="text"
              name="artiste"
              className="form-control"
              placeholder="Nom de l'artiste"
              value={filters.artiste || ''}
              onChange={onFilterChange}
              disabled={loading}
            />
          </div>

          {/* Date Range */}
          <div className="col-md-6">
            <label className="form-label">Date de création (min)</label>
            <input
              type="date"
              name="date_min"
              className="form-control"
              value={filters.date_min || ''}
              onChange={onFilterChange}
              disabled={loading}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Date de création (max)</label>
            <input
              type="date"
              name="date_max"
              className="form-control"
              value={filters.date_max || ''}
              onChange={onFilterChange}
              disabled={loading}
            />
          </div>

          {/* View Count Range */}
          <div className="col-md-6">
            <label className="form-label">Nombre minimum de vues</label>
            <input
              type="number"
              name="min_views"
              className="form-control"
              placeholder="0"
              min="0"
              value={filters.min_views || ''}
              onChange={onFilterChange}
              disabled={loading}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Nombre maximum de vues</label>
            <input
              type="number"
              name="max_views"
              className="form-control"
              placeholder="10000"
              min="0"
              value={filters.max_views || ''}
              onChange={onFilterChange}
              disabled={loading}
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {Object.entries(filters).some(([key, value]) => value && key !== 'sort') && (
          <div className="mt-3">
            <h6>Filtres actifs:</h6>
            <div className="d-flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (!value || key === 'sort') return null;

                const getLabel = (key, value) => {
                  switch (key) {
                    case 'q': return `Recherche: "${value}"`;
                    case 'style': return `Style: ${styleOptions.find(o => o.value === value)?.label || value}`;
                    case 'theme': return `Thème: ${themeOptions.find(o => o.value === value)?.label || value}`;
                    case 'couleur_principale': return `Couleur: ${colorOptions.find(o => o.value === value)?.label || value}`;
                    case 'tags': return `Tags: ${value}`;
                    case 'artiste': return `Artiste: ${value}`;
                    case 'date_min': return `À partir du: ${value}`;
                    case 'date_max': return `Jusqu'au: ${value}`;
                    case 'min_views': return `Vues min: ${value}`;
                    case 'max_views': return `Vues max: ${value}`;
                    default: return `${key}: ${value}`;
                  }
                };

                return (
                  <span key={key} className="badge bg-primary">
                    {getLabel(key, value)}
                    <button
                      type="button"
                      className="btn-close btn-close-white ms-2"
                      style={{fontSize: '0.6em'}}
                      onClick={() => onFilterChange({ target: { name: key, value: '' } })}
                      disabled={loading}
                    ></button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtworkFilters;