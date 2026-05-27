import { screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '../test-utils';
import ProtectedRoute from '../../client/components/ProtectedRoute';

const ProtectedContent = () => <div>Protected Content</div>;

describe('Composant ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('redirige vers la page d\'inscription quand le jeton d\'accès est manquant', () => {
    localStorage.removeItem('access_token');

    render(
      <ProtectedRoute>
        <ProtectedContent />
      </ProtectedRoute>
    );

    expect(screen.queryByText(/Protected Content/i)).not.toBeInTheDocument();
  });

  it('redirige vers la page d\'inscription quand les données utilisateur sont manquantes', () => {
    localStorage.setItem('access_token', 'fake-token-12345');
    localStorage.removeItem('user');

    render(
      <ProtectedRoute>
        <ProtectedContent />
      </ProtectedRoute>
    );

    expect(screen.queryByText(/Protected Content/i)).not.toBeInTheDocument();
  });

  it('gère correctement les données utilisateur corrompues lors de la vérification des rôles', () => {
    localStorage.setItem('access_token', 'fake-token-12345');
    localStorage.setItem('user', 'invalid-json');

    render(
      <ProtectedRoute>
        <ProtectedContent />
      </ProtectedRoute>
    );

    expect(screen.queryByText(/Protected Content/i)).not.toBeInTheDocument();
  });
});