import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // For now, we'll use a mock API call
      // In a real implementation, this would call your backend API
      const mockUsers = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          is_active: true,
          date_joined: '2024-01-01'
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        // Mock delete - replace with actual API call
        setUsers(users.filter(u => u.id !== userId));
        alert('Utilisateur supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <i className="fas fa-users me-2"></i>
          Gestion des Utilisateurs
        </h1>
        <div>
          <Link to="/admin/dashboard" className="btn btn-outline-secondary me-2">
            <i className="fas fa-arrow-left me-2"></i>Retour au tableau de bord
          </Link>
          <Link to="/admin/users/create" className="btn btn-success">
            <i className="fas fa-plus me-2"></i>Créer un utilisateur
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher des utilisateurs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-outline-secondary" type="button">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h5>Utilisateurs ({filteredUsers.length})</h5>
          </div>
          <div className="card-body">
            {filteredUsers.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Nom d'utilisateur</th>
                      <th>Email</th>
                      <th>Nom complet</th>
                      <th>Rôle</th>
                      <th>Statut</th>
                      <th>Date d'inscription</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{`${user.first_name} ${user.last_name}`}</td>
                        <td>
                          <span className={`badge ${
                            user.role === 'admin' ? 'bg-danger' :
                            user.role === 'curator' ? 'bg-warning' :
                            'bg-secondary'
                          }`}>
                            {user.role === 'admin' ? 'Administrateur' :
                             user.role === 'curator' ? 'Conservateur' :
                             'Visiteur'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${user.is_active ? 'bg-success' : 'bg-danger'}`}>
                            {user.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td>{new Date(user.date_joined).toLocaleDateString('fr-FR')}</td>
                        <td>
                          <div className="btn-group" role="group">
                            <Link
                              to={`/admin/users/edit/${user.id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              <i className="fas fa-edit"></i>
                            </Link>
                            {user.username !== 'admin' && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="alert alert-info text-center">
                <h4>Aucun utilisateur trouvé</h4>
                <p>
                  {searchQuery
                    ? `Aucun utilisateur ne correspond à "${searchQuery}".`
                    : "Il n'y a pas encore d'utilisateurs."
                  }
                </p>
                <Link to="/admin/users/create" className="btn btn-primary">
                  Créer le premier utilisateur
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;