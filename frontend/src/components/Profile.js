import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [preferences, setPreferences] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Note: In a real app, you'd get the current user profile
      // For now, we'll simulate with mock data
      const mockProfile = {
        preferences: 'J\'aime les styles abstraits et les couleurs vives. Je préfère les thèmes naturels et cosmiques.',
        viewed_oeuvres: [
          { id: 1, titre: 'Composition Abstraite 1', style: 'Abstract', theme: 'Nature' },
          { id: 2, titre: 'Géométrie Colorée', style: 'Geometric', theme: 'Urban' },
        ]
      };
      setProfile(mockProfile);
      setPreferences(mockProfile.preferences);

      // Mock recommendations
      const mockRecommendations = [
        { id: 3, titre: 'Cosmos Bleu', style: 'Abstract', theme: 'Cosmic', couleur_principale: 'Bleu' },
        { id: 4, titre: 'Forêt Vivante', style: 'Organic', theme: 'Nature', couleur_principale: 'Vert' },
      ];
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      // In a real app, you'd send this to the backend
      setProfile(prev => ({ ...prev, preferences }));
      setEditing(false);
      alert('Préférences sauvegardées!');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
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

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Mon Profil Artistique</h1>

      <div className="row">
        <div className="col-md-8">
          {/* Preferences Section */}
          <div className="card mb-4">
            <div className="card-header">
              <h3>Préférences</h3>
            </div>
            <div className="card-body">
              {editing ? (
                <div>
                  <div className="mb-3">
                    <label className="form-label">Mes préférences artistiques</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={preferences}
                      onChange={(e) => setPreferences(e.target.value)}
                      placeholder="Décrivez vos styles, thèmes et couleurs préférés..."
                    />
                    <div className="form-text">
                      Décrivez vos styles, thèmes et couleurs préférés pour personnaliser vos recommandations.
                    </div>
                  </div>
                  <button onClick={handleSavePreferences} className="btn btn-primary me-2">
                    Sauvegarder
                  </button>
                  <button onClick={() => setEditing(false)} className="btn btn-outline-secondary">
                    Annuler
                  </button>
                </div>
              ) : (
                <div>
                  <p>{profile.preferences}</p>
                  <button onClick={() => setEditing(true)} className="btn btn-outline-primary">
                    Modifier les préférences
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Viewed Artworks */}
          <div className="card">
            <div className="card-header">
              <h3>Œuvres Consultées Récemment</h3>
            </div>
            <div className="card-body">
              {profile.viewed_oeuvres && profile.viewed_oeuvres.length > 0 ? (
                <div className="row">
                  {profile.viewed_oeuvres.map(oeuvre => (
                    <div key={oeuvre.id} className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="card-title">{oeuvre.titre}</h6>
                          <p className="card-text small mb-1">
                            {oeuvre.style} - {oeuvre.theme}
                          </p>
                          <Link to={`/oeuvre/${oeuvre.id}`} className="btn btn-sm btn-outline-primary">
                            Voir
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">Vous n'avez pas encore consulté d'œuvres.</p>
              )}
              <div className="mt-3">
                <Link to="/catalogue" className="btn btn-primary">Explorer le Catalogue</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          {/* Recommendations */}
          <div className="card mb-3">
            <div className="card-header">
              <h3>Recommandations Personnalisées</h3>
            </div>
            <div className="card-body">
              {recommendations.length > 0 ? (
                <>
                  <p className="text-muted mb-3">
                    Basé sur vos préférences et œuvres consultées :
                  </p>
                  {recommendations.map(oeuvre => (
                    <div key={oeuvre.id} className="mb-3 p-2 border rounded">
                      <h6>{oeuvre.titre}</h6>
                      <p className="small mb-1">
                        {oeuvre.style} - {oeuvre.theme} - {oeuvre.couleur_principale}
                      </p>
                      <Link to={`/oeuvre/${oeuvre.id}`} className="btn btn-sm btn-primary">
                        Découvrir
                      </Link>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-muted">
                  Consultez plus d'œuvres pour recevoir des recommandations personnalisées.
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-body text-center">
              <h5>Actions</h5>
              <Link to="/generer" className="btn btn-success mb-2 w-100">
                🎨 Créer une Œuvre
              </Link>
              <Link to="/catalogue" className="btn btn-outline-primary w-100">
                Explorer le Catalogue
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;