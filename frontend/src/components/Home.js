import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">ArtGroupNova 🎨</h1>
              <p className="lead mb-4">
                Découvrez une galerie interactive en ligne où l'art prend vie grâce à l'intelligence artificielle.
                Explorez des œuvres uniques générées procéduralement et laissez-vous immerger dans une expérience artistique personnalisée.
              </p>
              <div className="d-flex gap-3">
                <Link to="/catalogue" className="btn btn-light btn-lg">Explorer le Catalogue</Link>
                {isAuthenticated && (user?.role === 'artist' || user?.role === 'curator' || user?.role === 'admin') ? (
                  <Link to="/generer" className="btn btn-outline-light btn-lg">Créer une Œuvre</Link>
                ) : (
                  <Link to="/login" className="btn btn-outline-light btn-lg">Se connecter pour créer</Link>
                )}
              </div>
            </div>
            <div className="col-lg-6">
              <div className="text-center">
                <div style={{fontSize: '8rem'}}>🎨</div>
                <p className="mt-3">Art généré par IA • Expérience immersive • Collection unique</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container my-5">
        <div className="row text-center mb-5">
          <div className="col-md-4">
            <div className="feature-card p-4">
              <div className="mb-3" style={{fontSize: '3rem'}}>🤖</div>
              <h3>Génération IA</h3>
              <p>Chaque œuvre est créée de manière procédurale avec Python et Pillow,
              produisant des compositions abstraites uniques et originales.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card p-4">
              <div className="mb-3" style={{fontSize: '3rem'}}>🎯</div>
              <h3>Expérience Personnalisée</h3>
              <p>Découvrez des œuvres adaptées à vos goûts grâce à notre système
              de recommandations basé sur vos préférences artistiques.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card p-4">
              <div className="mb-3" style={{fontSize: '3rem'}}>🌟</div>
              <h3>Collection Interactive</h3>
              <p>Naviguez dans notre catalogue avec des filtres avancés,
              explorez les galeries virtuelles et plongez dans l'art numérique.</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h3 className="card-title">📚 Catalogue d'Œuvres</h3>
                <p className="card-text">Explorez notre collection d'œuvres d'art générées par IA.
                Utilisez nos filtres pour trouver exactement ce que vous cherchez.</p>
                <Link to="/catalogue" className="btn btn-primary">Voir le Catalogue</Link>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h3 className="card-title">🎨 Créer de l'Art</h3>
                <p className="card-text">Générez vos propres œuvres d'art uniques.
                Notre algorithme crée des compositions originales à chaque fois.</p>
                {isAuthenticated && (user?.role === 'artist' || user?.role === 'curator' || user?.role === 'admin') ? (
                  <Link to="/generer" className="btn btn-success">Créer une Œuvre</Link>
                ) : (
                  <Link to="/login" className="btn btn-success">Se connecter pour créer</Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="text-center mt-5">
          <h2>Navigation</h2>
          <div className="row mt-4">
            <div className="col-md-3">
              <Link to="/galleries" className="btn btn-outline-primary btn-lg w-100 mb-3">🏛️ Galeries</Link>
            </div>
            <div className="col-md-3">
              <Link to="/exhibitions" className="btn btn-outline-primary btn-lg w-100 mb-3">🎭 Expositions Virtuelles</Link>
            </div>
            <div className="col-md-3">
              <Link to="/catalogue" className="btn btn-outline-primary btn-lg w-100 mb-3">📖 Catalogue</Link>
            </div>
            <div className="col-md-3">
              <Link to="/catalogue/search" className="btn btn-outline-primary btn-lg w-100 mb-3">🔍 Recherche Avancée</Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 60vh;
        }

        .feature-card {
          background: #f8f9fa;
          border-radius: 10px;
          transition: transform 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

export default Home;