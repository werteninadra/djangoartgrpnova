import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({
  children,
  requiredRoles = [],
  requireAuth = true
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, check if user has the required role
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    if (!hasRequiredRole) {
      return (
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="alert alert-danger text-center" role="alert">
                <i className="fas fa-exclamation-triangle fa-3x mb-3"></i>
                <h4 className="alert-heading">Accès refusé</h4>
                <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
                <hr />
                <p className="mb-0">
                  Rôle requis: {requiredRoles.join(' ou ')}<br />
                  Votre rôle: {user.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;