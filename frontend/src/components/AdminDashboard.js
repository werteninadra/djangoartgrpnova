import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    artworks: 0,
    galleries: 0,
    exhibitions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // We'll implement API calls later
      // For now, set default stats
      setStats({
        users: 1,
        artworks: 0,
        galleries: 0,
        exhibitions: 0
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          Accès refusé. Vous devez être administrateur pour accéder à cette page.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          <i className="fas fa-tachometer-alt me-2"></i>
          Tableau de Bord Administrateur
        </h1>
        <button onClick={logout} className="btn btn-outline-danger">
          <i className="fas fa-sign-out-alt me-2"></i>
          Déconnexion
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h5 className="card-title">Utilisateurs</h5>
                  <h2>{stats.users}</h2>
                </div>
                <i className="fas fa-users fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h5 className="card-title">Œuvres</h5>
                  <h2>{stats.artworks}</h2>
                </div>
                <i className="fas fa-palette fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h5 className="card-title">Galeries</h5>
                  <h2>{stats.galleries}</h2>
                </div>
                <i className="fas fa-building fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h5 className="card-title">Expositions</h5>
                  <h2>{stats.exhibitions}</h2>
                </div>
                <i className="fas fa-calendar-alt fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Management Sections */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h4><i className="fas fa-users me-2"></i>Gestion des Utilisateurs</h4>
            </div>
            <div className="card-body">
              <p>Gérer les comptes utilisateurs, rôles et permissions.</p>
              <div className="d-grid gap-2">
                <Link to="/admin/users" className="btn btn-primary">
                  <i className="fas fa-list me-2"></i>Voir tous les utilisateurs
                </Link>
                <Link to="/admin/users/create" className="btn btn-success">
                  <i className="fas fa-plus me-2"></i>Créer un utilisateur
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h4><i className="fas fa-palette me-2"></i>Gestion du Catalogue</h4>
            </div>
            <div className="card-body">
              <p>Gérer les œuvres d'art, tags et métadonnées.</p>
              <div className="d-grid gap-2">
                <Link to="/admin/catalogue" className="btn btn-primary">
                  <i className="fas fa-list me-2"></i>Voir toutes les œuvres
                </Link>
                <Link to="/admin/catalogue/create" className="btn btn-success">
                  <i className="fas fa-plus me-2"></i>Ajouter une œuvre
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h4><i className="fas fa-building me-2"></i>Gestion des Galeries</h4>
            </div>
            <div className="card-body">
              <p>Gérer les galeries, salles et expositions virtuelles.</p>
              <div className="d-grid gap-2">
                <Link to="/admin/galleries" className="btn btn-primary">
                  <i className="fas fa-list me-2"></i>Voir toutes les galeries
                </Link>
                <Link to="/admin/galleries/create" className="btn btn-success">
                  <i className="fas fa-plus me-2"></i>Créer une galerie
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h4><i className="fas fa-calendar-alt me-2"></i>Gestion des Expositions</h4>
            </div>
            <div className="card-body">
              <p>Gérer les expositions physiques et virtuelles.</p>
              <div className="d-grid gap-2">
                <Link to="/admin/exhibitions" className="btn btn-primary">
                  <i className="fas fa-list me-2"></i>Voir toutes les expositions
                </Link>
                <Link to="/admin/exhibitions/create" className="btn btn-success">
                  <i className="fas fa-plus me-2"></i>Créer une exposition
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h4>Actions Rapides</h4>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3 mb-2">
              <Link to="/generer" className="btn btn-outline-success w-100">
                <i className="fas fa-magic me-2"></i>Générer une œuvre IA
              </Link>
            </div>
            <div className="col-md-3 mb-2">
              <Link to="/catalogue" className="btn btn-outline-primary w-100">
                <i className="fas fa-search me-2"></i>Parcourir le catalogue
              </Link>
            </div>
            <div className="col-md-3 mb-2">
              <Link to="/galleries" className="btn btn-outline-info w-100">
                <i className="fas fa-building me-2"></i>Voir les galeries
              </Link>
            </div>
            <div className="col-md-3 mb-2">
              <Link to="/virtual-exhibitions" className="btn btn-outline-warning w-100">
                <i className="fas fa-vr-cardboard me-2"></i>Expositions virtuelles
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;