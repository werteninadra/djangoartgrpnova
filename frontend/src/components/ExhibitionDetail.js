import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

const ExhibitionDetail = () => {
  const { uuid } = useParams();
  const [exhibition, setExhibition] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [session, setSession] = useState(null);
  const [currentArtwork, setCurrentArtwork] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExhibitionDetail();
  }, [uuid]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchExhibitionDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:8000/expositions/${uuid}/`, {
        withCredentials: true
      });
      setExhibition(response.data);
      setArtworks([]); // For now, empty array
      setSession(null);
      setCurrentArtwork(null);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'exposition:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTour = async () => {
    try {
      await axios.post(`http://127.0.0.1:8000/virtual-exhibitions/${uuid}/api/start-session/`);
      fetchExhibitionDetail(); // Refresh data
    } catch (error) {
      console.error('Erreur lors du démarrage de la visite:', error);
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

  if (!exhibition) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          Exposition non trouvée.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header">
              <h1 className="mb-0">{exhibition.title}</h1>
            </div>
            <div className="card-body">
              <p className="lead">{exhibition.description}</p>
              <div className="mb-3">
                <small className="text-muted">
                  Thème: {exhibition.theme} •
                  Statut: {exhibition.actif ? 'Active' : 'Inactive'}
                </small>
              </div>
              <div className="d-flex gap-2">
                <button onClick={startTour} className="btn btn-success">
                  <i className="fas fa-play"></i> Commencer la Visite Virtuelle
                </button>
                <Link to={`/exhibitions/${uuid}/tour`} className="btn btn-outline-primary">
                  <i className="fas fa-route"></i> Visite Interactive
                </Link>
              </div>
            </div>
          </div>

          {/* Current Artwork Display */}
          {currentArtwork && (
            <div className="card mb-4">
              <div className="card-header">
                <h3>Œuvre Actuelle: {currentArtwork.oeuvre.titre}</h3>
              </div>
              <div className="card-body">
                {currentArtwork.oeuvre.image && (
                  <img
                    src={`http://127.0.0.1:8000${currentArtwork.oeuvre.image}`}
                    className="img-fluid mb-3"
                    alt={currentArtwork.oeuvre.titre}
                    style={{maxHeight: '400px', width: '100%', objectFit: 'contain'}}
                  />
                )}
                <p>{currentArtwork.oeuvre.description}</p>
                {currentArtwork.description && (
                  <div className="alert alert-info">
                    <strong>Note du curateur:</strong> {currentArtwork.description}
                  </div>
                )}
                <div className="mb-2">
                  <small className="text-muted">
                    Style: {currentArtwork.oeuvre.style} •
                    Thème: {currentArtwork.oeuvre.theme} •
                    Couleur: {currentArtwork.oeuvre.couleur_principale}
                  </small>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="col-lg-4">
          {/* Exhibition Progress */}
          {session && (
            <div className="card mb-4">
              <div className="card-header">
                <h5>Progression de la Visite</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="progress">
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{width: `${(session.current_artwork_index / artworks.length) * 100}%`}}
                      aria-valuenow={session.current_artwork_index}
                      aria-valuemin="0"
                      aria-valuemax={artworks.length}
                    >
                      {session.current_artwork_index} / {artworks.length}
                    </div>
                  </div>
                </div>
                <p className="mb-1">Position: {session.current_artwork_index + 1} sur {artworks.length}</p>
                {session.completed && (
                  <div className="alert alert-success">
                    <i className="fas fa-check"></i> Visite terminée!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Artworks List */}
          <div className="card">
            <div className="card-header">
              <h5>Œuvres de l'Exposition ({artworks.length})</h5>
            </div>
            <div className="card-body" style={{maxHeight: '400px', overflowY: 'auto'}}>
              {artworks.map((artwork, index) => (
                <div key={artwork.id} className="mb-2 p-2 border rounded">
                  <div className="d-flex align-items-center">
                    <span className="badge bg-secondary me-2">{index + 1}</span>
                    <div className="flex-grow-1">
                      <h6 className="mb-0">{artwork.oeuvre.titre}</h6>
                      <small className="text-muted">{artwork.oeuvre.style}</small>
                    </div>
                    {session && session.current_artwork_index === index && (
                      <i className="fas fa-eye text-primary"></i>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExhibitionDetail;