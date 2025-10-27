import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ArtworkDetail = () => {
  const { id } = useParams();
  const [oeuvre, setOeuvre] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOeuvre();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOeuvre = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:8000/catalogue/oeuvres/${id}/`);
      setOeuvre(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'œuvre:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!oeuvre) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          Œuvre non trouvée.
        </div>
        <Link to="/catalogue" className="btn btn-primary">Retour au Catalogue</Link>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8">
          <h1>{oeuvre.titre}</h1>
          {oeuvre.image && (
            <img
              src={`http://127.0.0.1:8000${oeuvre.image}`}
              alt={oeuvre.titre}
              className="img-fluid mb-3"
              style={{maxHeight: '600px'}}
            />
          )}
          <p className="lead">{oeuvre.description}</p>
          <div className="row">
            <div className="col-sm-4">
              <strong>Style:</strong> {oeuvre.style}
            </div>
            <div className="col-sm-4">
              <strong>Thème:</strong> {oeuvre.theme}
            </div>
            <div className="col-sm-4">
              <strong>Couleur principale:</strong> {oeuvre.couleur_principale}
            </div>
          </div>
          <div className="mt-3">
            <strong>Tags:</strong>
            {oeuvre.tags && oeuvre.tags.length > 0 ? oeuvre.tags.map(tag => (
              <span key={tag.id} className="badge bg-secondary me-1">{tag.nom}</span>
            )) : (
              <span className="text-muted">Aucun tag</span>
            )}
          </div>
          {oeuvre.artiste && (
            <p className="mt-3"><strong>Artiste:</strong> {oeuvre.artiste}</p>
          )}
          <p className="text-muted">
            Créée le {new Date(oeuvre.date_creation).toLocaleDateString('fr-FR')}
          </p>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Actions</h5>
              <Link to="/generer" className="btn btn-primary mb-2 w-100">
                🎨 Générer une nouvelle œuvre
              </Link>
              <Link to="/profil" className="btn btn-outline-primary mb-2 w-100">
                Mon profil
              </Link>
              <Link to="/catalogue" className="btn btn-outline-secondary w-100">
                ← Retour au Catalogue
              </Link>
            </div>
          </div>

          {/* Immersive Features */}
          <div className="card mt-3">
            <div className="card-body">
              <h5 className="card-title">Expérience Immersive</h5>
              <button
                className="btn btn-info mb-2 w-100"
                onClick={() => alert('Mode plein écran activé!')}
              >
                🖼️ Plein Écran
              </button>
              <button
                className="btn btn-warning mb-2 w-100"
                onClick={() => alert('Mode sombre activé!')}
              >
                🌙 Mode Sombre
              </button>
              <button
                className="btn btn-success w-100"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: oeuvre.titre,
                      text: oeuvre.description,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Lien copié dans le presse-papiers!');
                  }
                }}
              >
                📤 Partager
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetail;