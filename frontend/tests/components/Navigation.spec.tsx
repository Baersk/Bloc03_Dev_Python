import { screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '../test-utils';
import Navigation from '../../client/components/Navigation';

describe('Composant Navigation', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('affiche correctement les liens publics', () => {
    render(<Navigation />);
    expect(screen.getByText(/Parcourir/i)).toBeInTheDocument();
    expect(screen.getByText(/Services/i)).toBeInTheDocument();
    expect(screen.getByText(/À propos/i)).toBeInTheDocument();
  });

  it('affiche le bouton S\'inscrire lorsque l\'utilisateur n\'est pas connecté', () => {
    render(<Navigation />);
    expect(screen.getByRole('link', { name: /S'inscrire/i })).toBeInTheDocument();
  });

  it('inclut tous les éléments principaux de navigation', () => {
    render(<Navigation />);
    expect(screen.getByText(/Parcourir/i)).toBeInTheDocument();
    expect(screen.getByText(/Services/i)).toBeInTheDocument();
    expect(screen.getByText(/À propos/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact/i)).toBeInTheDocument();
  });
});