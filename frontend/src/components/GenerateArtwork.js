import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const GenerateArtwork = () => {
  const [loading, setLoading] = useState(false);
  const [generatedOeuvre, setGeneratedOeuvre] = useState(null);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://127.0.0.1:8000/catalogue/generer/', {}, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true  // Important for CSRF and session cookies
      });

      if (response.data && response.data.id) {
        setGeneratedOeuvre(response.data);
        // Redirect to the new artwork after a short delay
        setTimeout(() => {
          navigate(`/oeuvre/${response.data.id}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      alert('Erreur lors de la génération de l\'œuvre. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">🎨 Générateur d'Œuvres d'Art IA</h2>
            </div>
            <div className="card-body text-center">
              {!generatedOeuvre ? (
                <>
                  <p className="lead mb-4">
                    Créez des œuvres d'art uniques générées par intelligence artificielle.
                    Chaque œuvre est procéduralement générée avec des formes géométriques,
                    des couleurs et des compositions aléatoirement choisies.
                  </p>

                  <div className="alert alert-info mb-4">
                    <strong>Comment ça marche ?</strong><br />
                    Notre algorithme utilise Python et la bibliothèque Pillow pour créer
                    des compositions abstraites uniques. Chaque génération produit une œuvre
                    originale avec des styles, thèmes et couleurs variés.
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="btn btn-success btn-lg"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        🚀 Générer une Nouvelle Œuvre
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="generated-success">
                  <div className="mb-4">
                    <div style={{fontSize: '4rem'}}>🎨</div>
                    <h3 className="text-success">Œuvre générée avec succès !</h3>
                    <p className="lead">"{generatedOeuvre.titre}"</p>
                  </div>

                  <div className="alert alert-success">
                    <strong>Félicitations !</strong> Votre œuvre d'art unique a été créée.
                    Vous allez être redirigé vers la page de détails dans quelques instants...
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={() => navigate(`/oeuvre/${generatedOeuvre.id}`)}
                      className="btn btn-primary me-2"
                    >
                      Voir l'Œuvre Maintenant
                    </button>
                    <button
                      onClick={() => navigate('/catalogue')}
                      className="btn btn-outline-secondary"
                    >
                      Retour au Catalogue
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <button
                  onClick={() => navigate('/catalogue')}
                  className="btn btn-outline-primary"
                  disabled={loading}
                >
                  ← Retour au Catalogue
                </button>
              </div>
            </div>
          </div>

          {/* Features Showcase */}
          <div className="row mt-4">
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <div style={{fontSize: '2rem'}}>🎭</div>
                  <h6>Styles Variés</h6>
                  <small className="text-muted">Abstract, Géométrique, Minimaliste...</small>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <div style={{fontSize: '2rem'}}>🌈</div>
                  <h6>Couleurs Uniques</h6>
                  <small className="text-muted">Palettes générées aléatoirement</small>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <div style={{fontSize: '2rem'}}>✨</div>
                  <h6>100% Original</h6>
                  <small className="text-muted">Chaque œuvre est unique</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateArtwork;