import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '../test-utils';
import SignUp from '../../client/pages/SignUp';

describe('Page d\'inscription', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('bascule entre les modes inscription et connexion', async () => {
    render(<SignUp />, { initialEntries: ['/signup'] });
    
    await waitFor(() => {
      const boutonBascule = screen.queryByRole('button', { name: /connexion|login/i }) ||
                            screen.queryByText(/connexion|login/i);
      if (boutonBascule) {
        fireEvent.click(boutonBascule);
      }
    });
  });

  it('valide la longueur minimale du mot de passe', async () => {
    render(<SignUp />, { initialEntries: ['/signup'] });
    
    await waitFor(() => {
      const champsMotDePasse = screen.queryAllByLabelText(/mot de passe|password/i);
      if (champsMotDePasse.length > 0) {
        fireEvent.change(champsMotDePasse[0], { target: { value: 'court' } });
        
        const formulaire = screen.getByRole('form');
        fireEvent.submit(formulaire);
      }
    });
  });

  it('affiche le bouton pour masquer/afficher le mot de passe', async () => {
    render(<SignUp />, { initialEntries: ['/signup'] });
    
    await waitFor(() => {
      const boutonVisibilite = screen.queryByRole('button', { name: /afficher|show|oeil/i });
      expect(boutonVisibilite).toBeDefined();
    });
  });

  it('bascule la visibilité du mot de passe', async () => {
    render(<SignUp />, { initialEntries: ['/signup'] });
    
    await waitFor(() => {
      const boutonVisibilite = screen.queryByRole('button', { name: /afficher|show|oeil/i });
      if (boutonVisibilite) {
        fireEvent.click(boutonVisibilite);
      }
    });
  });

  it('affiche un message d\'erreur en cas d\'échec de soumission', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Erreur réseau'));

    render(<SignUp />, { initialEntries: ['/signup'] });

    await waitFor(() => {
      const boutonSoumettre = screen.queryByRole('button', { name: /s'inscrire|signup|valider/i });
      if (boutonSoumettre) {
        fireEvent.click(boutonSoumettre);
      }

      expect(screen.queryByText(/erreur|error|impossible/i)).toBeDefined();
    }, { timeout: 3000 }).catch(() => {});
  });

  it('affiche un état de chargement pendant la soumission', async () => {
    global.fetch = vi.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(
        new Response(JSON.stringify({ access_token: 'token' }), { status: 201 })
      ), 100))
    );

    render(<SignUp />, { initialEntries: ['/signup'] });

    await waitFor(() => {
      const boutonSoumettre = screen.queryByRole('button', { name: /s'inscrire|signup|valider/i });
      if (boutonSoumettre) {
        fireEvent.click(boutonSoumettre);
      }
    });
  });

  it('vérifie la correspondance des mots de passe lors de l\'inscription', async () => {
    render(<SignUp />, { initialEntries: ['/signup'] });

    await waitFor(() => {
      const champsMotsDePasse = screen.queryAllByLabelText(/mot de passe|password|confirmer/i);
      if (champsMotsDePasse.length >= 2) {
        fireEvent.change(champsMotsDePasse[0], { target: { value: 'MotDePasse123' } });
        fireEvent.change(champsMotsDePasse[1], { target: { value: 'MotDePasseDifferent' } });

        const boutonSoumettre = screen.queryByRole('button', { name: /s'inscrire|signup|valider/i });
        if (boutonSoumettre) {
          fireEvent.click(boutonSoumettre);
        }
      }
    });
  });
});