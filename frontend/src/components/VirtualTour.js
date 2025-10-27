import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const VirtualTour = () => {
  const { uuid } = useParams();
  const [session, setSession] = useState(null);
  const [currentArtwork, setCurrentArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    fetchSessionProgress();
  }, [uuid]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSessionProgress = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:8000/virtual-exhibitions/${uuid}/api/progress/`);
      setSession(response.data);
      setCurrentArtwork(response.data.current_artwork);
    } catch (error) {
      console.error('Erreur lors du chargement de la progression:', error);
    } finally {
      setLoading(false);
    }
  };

  const advanceArtwork = async () => {
    try {
      setAdvancing(true);
      const response = await axios.post(`http://127.0.0.1:8000/virtual-exhibitions/${uuid}/api/advance/`);
      setSession(prev => ({
        ...prev,
        current_index: response.data.current_index,
        completed: response.data.completed
      }));
      setCurrentArtwork(response.data.current_artwork);
    } catch (error) {
      console.error('Erreur lors de l\'avancement:', error);
    } finally {
      setAdvancing(false);
    }
  };

  const goToArtwork = async (index) => {
    try {
      const response = await axios.post(`http://127.0.0.1:8000/virtual-exhibitions/${uuid}/api/go-to/`, {
        index: index
      });
      setSession(prev => ({
        ...prev,
        current_index: response.data.current_index
      }));
      setCurrentArtwork(response.data.current_artwork);
    } catch (error) {
      console.error('Erreur lors du saut vers l\'œuvre:', error);
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

  if (!session) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          Session non trouvée. <Link to={`/exhibitions/${uuid}`}>Retourner à l'exposition</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mb-0">Visite Virtuelle</h1>
            <Link to={`/exhibitions/${uuid}`} className="btn btn-outline-secondary">
              <i className="fas fa-arrow-left"></i> Retour à l'Exposition
            </Link>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Progression: {session.current_index + 1} / {session.total_artworks}</span>
                {session.completed && (
                  <span className="badge bg-success">Terminée</span>
                )}
              </div>
              <div className="progress">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{width: `${((session.current_index + 1) / session.total_artworks) * 100}%`}}
                  aria-valuenow={session.current_index + 1}
                  aria-valuemin="1"
                  aria-valuemax={session.total_artworks}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Main Artwork Display */}
        <div className="col-lg-8">
          {currentArtwork ? (
            <div className="card h-100">
              <div className="card-header">
                <h3 className="mb-0">{currentArtwork.title}</h3>
              </div>
              <div className="card-body text-center">
                {currentArtwork.image_url && (
                  <img
                    src={`http://127.0.0.1:8000${currentArtwork.image_url}`}
                    className="img-fluid mb-4"
                    alt={currentArtwork.title}
                    style={{
                      maxHeight: '60vh',
                      width: '100%',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                  />
                )}
                <p className="lead mb-4">{currentArtwork.description}</p>

                {/* Navigation Controls */}
                <div className="d-flex justify-content-center gap-3 mb-4">
                  <button
                    onClick={() => goToArtwork(Math.max(0, session.current_index - 1))}
                    disabled={session.current_index === 0}
                    className="btn btn-outline-primary btn-lg"
                  >
                    <i className="fas fa-chevron-left"></i> Précédent
                  </button>

                  <button
                    onClick={advanceArtwork}
                    disabled={session.completed || advancing}
                    className="btn btn-primary btn-lg"
                  >
                    {advancing ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    ) : (
                      <i className="fas fa-chevron-right me-2"></i>
                    )}
                    {session.completed ? 'Terminée' : 'Suivant'}
                  </button>
                </div>

                {session.completed && (
                  <div className="alert alert-success">
                    <i className="fas fa-check-circle me-2"></i>
                    Félicitations ! Vous avez terminé la visite de cette exposition.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card h-100">
              <div className="card-body text-center d-flex align-items-center justify-content-center">
                <div>
                  <i className="fas fa-image fa-4x text-muted mb-3"></i>
                  <h4>Aucune œuvre disponible</h4>
                  <p>Cette exposition ne contient pas encore d'œuvres.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Quick Navigation */}
          <div className="card mb-4">
            <div className="card-header">
              <h5>Navigation Rapide</h5>
            </div>
            <div className="card-body" style={{maxHeight: '300px', overflowY: 'auto'}}>
              {Array.from({length: session.total_artworks}, (_, i) => (
                <button
                  key={i}
                  onClick={() => goToArtwork(i)}
                  className={`btn w-100 mb-2 ${
                    i === session.current_index ? 'btn-primary' : 'btn-outline-secondary'
                  }`}
                >
                  Œuvre {i + 1}
                  {i === session.current_index && <i className="fas fa-eye ms-2"></i>}
                </button>
              ))}
            </div>
          </div>

          {/* Tour Info */}
          <div className="card">
            <div className="card-header">
              <h5>Informations de la Visite</h5>
            </div>
            <div className="card-body">
              <p className="mb-2">
                <strong>Position actuelle:</strong> {session.current_index + 1} sur {session.total_artworks}
              </p>
              <p className="mb-2">
                <strong>Statut:</strong>
                <span className={`badge ms-2 ${session.completed ? 'bg-success' : 'bg-warning'}`}>
                  {session.completed ? 'Terminée' : 'En cours'}
                </span>
              </p>
              <div className="d-grid gap-2">
                <Link to={`/exhibitions/${uuid}`} className="btn btn-outline-info">
                  <i className="fas fa-info-circle me-2"></i> Détails de l'Exposition
                </Link>
                <Link to="/exhibitions" className="btn btn-outline-secondary">
                  <i className="fas fa-list me-2"></i> Toutes les Expositions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTour;