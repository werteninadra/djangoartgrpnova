import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

const GalleryDetail = () => {
  const { id } = useParams();
  const [gallery, setGallery] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleryDetail();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchGalleryDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:8000/galeries/${id}/`, {
        withCredentials: true
      });
      // Handle different response formats
      if (response.data.gallery) {
        setGallery(response.data.gallery);
        setRooms(response.data.rooms || []);
        setCollections(response.data.collections || []);
      } else {
        // Assume response.data is the gallery object directly
        setGallery(response.data);
        setRooms([]);
        setCollections([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la galerie:', error);
      setGallery(null);
      setRooms([]);
      setCollections([]);
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

  if (!gallery) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          Galerie non trouvée.
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
              <h1 className="mb-0">{gallery.name}</h1>
            </div>
            <div className="card-body">
              <p className="lead">{gallery.description}</p>
              <div className="mb-3">
                <small className="text-muted">
                  Gérant: {gallery.manager || 'Non assigné'}
                </small>
              </div>
              <div className="d-flex gap-2">
                <Link to={`/galleries/${id}/virtual`} className="btn btn-success">
                  <i className="fas fa-vr-cardboard"></i> Visite Virtuelle 3D
                </Link>
                <Link to={`/galleries/${id}/manage`} className="btn btn-outline-primary">
                  <i className="fas fa-cogs"></i> Gérer la Galerie
                </Link>
              </div>
            </div>
          </div>

          {/* Collections */}
          {collections.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <h3>Collections ({collections.length})</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  {collections.map(collection => (
                    <div key={collection.id} className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="card-title">{collection.name}</h6>
                          <span className={`badge ${collection.is_active ? 'bg-success' : 'bg-secondary'}`}>
                            {collection.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Rooms */}
          <div className="card">
            <div className="card-header">
              <h3>Salles ({rooms.length})</h3>
            </div>
            <div className="card-body">
              {rooms.length > 0 ? (
                <div className="row">
                  {rooms.map(room => (
                    <div key={room.id} className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title">{room.name}</h5>
                          <p className="card-text">{room.description || 'Aucune description'}</p>
                          <div className="mb-2">
                            <small className="text-muted">
                              {room.placements ? `${room.placements.length} œuvres` : 'Aucune œuvre'}
                            </small>
                          </div>
                          <Link to={`/galleries/${id}/rooms/${room.id}`} className="btn btn-outline-primary">
                            Explorer la Salle
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info">
                  Cette galerie n'a pas encore de salles.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {/* Gallery Stats */}
          <div className="card mb-4">
            <div className="card-header">
              <h5>Statistiques</h5>
            </div>
            <div className="card-body">
              <div className="mb-2">
                <strong>Collections:</strong> {collections.length}
              </div>
              <div className="mb-2">
                <strong>Salles:</strong> {rooms.length}
              </div>
              <div className="mb-2">
                <strong>Œuvres totales:</strong> {rooms.reduce((total, room) => total + (room.placements ? room.placements.length : 0), 0)}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card mb-4">
            <div className="card-body text-center">
              <h5>Actions</h5>
              <Link to={`/galleries/${id}/add-room`} className="btn btn-success mb-2 w-100">
                <i className="fas fa-plus"></i> Ajouter une Salle
              </Link>
              <Link to={`/galleries/${id}/manage`} className="btn btn-outline-primary w-100">
                <i className="fas fa-cogs"></i> Gestion Avancée
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div className="card">
            <div className="card-body text-center">
              <h5>Navigation</h5>
              <Link to="/galleries" className="btn btn-outline-secondary w-100 mb-2">
                <i className="fas fa-arrow-left"></i> Toutes les Galeries
              </Link>
              <Link to="/catalogue" className="btn btn-outline-info w-100">
                <i className="fas fa-palette"></i> Catalogue d'Art
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryDetail;