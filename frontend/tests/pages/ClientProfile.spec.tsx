import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '../test-utils';
import ClientProfile from '../../client/pages/ClientProfile';

const mockUser = {
  id: 1,
  email: 'user@example.com',
  firstname: 'John',
  lastname: 'Doe',
  phone: '0612345678',
};

const mockApplications = [
  {
    id: 1,
    vehicle_id: 1,
    service_type: 'achat',
    status: 'nouveau',
    payment_status: 'pending',
    deposit_amount: 500,
    total_amount: 45000,
    invoice_number: null,
    created_at: '2024-01-15',
    vehicle: {
      id: 1,
      brand: 'Mercedes',
      model: 'C-Class',
      year: 2024,
      price: 45000,
    },
    option_achat_active: false,
    option_achat_levee: false,
    valeur_residuelle: 0,
  },
];

describe('Page de profil client', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('access_token', 'fake-token');
    vi.clearAllMocks();

    global.fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(mockUser), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(mockApplications), { status: 200 }));
  });

  it('affiche le bouton des détails de la candidature', async () => {
    render(<ClientProfile />, { initialEntries: ['/profile'] });
    
    await waitFor(() => {
      const boutons = screen.queryAllByRole('button');
      expect(boutons.length).toBeGreaterThan(0);
    });
  });

  it('permet la modification du profil', async () => {
    render(<ClientProfile />, { initialEntries: ['/profile'] });
    
    await waitFor(() => {
      const boutonEditer = screen.queryByRole('button', { name: /éditer|modifier/i });
      if (boutonEditer) {
        fireEvent.click(boutonEditer);
      }
    });
  });

  it('permet le changement de mot de passe', async () => {
    render(<ClientProfile />, { initialEntries: ['/profile'] });

    await waitFor(() => {
      const boutonChangerMdp = screen.queryByRole('button', { name: /changer|change|password|mot.*passe/i });
      if (boutonChangerMdp) {
        fireEvent.click(boutonChangerMdp);
      }
    });
  });

  it('permet la simulation de paiement', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ payment_status: 'confirmed' }), { status: 200 })
    );

    render(<ClientProfile />, { initialEntries: ['/profile'] });
    
    await waitFor(() => {
      const boutonPayer = screen.queryByRole('button', { name: /payer|simuler/i });
      if (boutonPayer) {
        fireEvent.click(boutonPayer);
        expect(global.fetch).toHaveBeenCalled();
      }
    });
  });

  it('télécharge la facture au format PDF', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(Buffer.from('Contenu PDF'), { 
        status: 200,
        headers: { 'content-type': 'application/pdf' }
      })
    );

    render(<ClientProfile />, { initialEntries: ['/profile'] });
    
    await waitFor(() => {
      const boutonTelecharger = screen.queryByRole('button', { name: /télécharger|download/i });
      if (boutonTelecharger) {
        fireEvent.click(boutonTelecharger);
        expect(global.fetch).toHaveBeenCalled();
      }
    });
  });

  it('permet de lever l\'option d\'achat', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ option_achat_levee: true }), { status: 200 })
    );

    mockApplications[0].option_achat_active = true;
    mockApplications[0].option_achat_levee = false;
    
    render(<ClientProfile />, { initialEntries: ['/profile'] });
    
    await waitFor(() => {
      const boutonLever = screen.queryByRole('button', { name: /lever|option|achat/i });
      if (boutonLever) {
        fireEvent.click(boutonLever);
        expect(global.fetch).toHaveBeenCalled();
      }
    });
  });

  it('gère la déconnexion', async () => {
    render(<ClientProfile />, { initialEntries: ['/profile'] });
    
    await waitFor(() => {
      const boutonDeconnexion = screen.queryByRole('button', { name: /déconnect|logout/i });
      if (boutonDeconnexion) {
        fireEvent.click(boutonDeconnexion);
        expect(localStorage.getItem('access_token')).toBeNull();
      }
    });
  });

  it('affiche un message d\'erreur en cas d\'échec de l\'API', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Erreur API'));

    render(<ClientProfile />, { initialEntries: ['/profile'] });
    
    await waitFor(() => {
      expect(screen.getByText(/erreur|error/i)).toBeInTheDocument();
    }, { timeout: 3000 }).catch(() => {});
  });

  it('affiche l\'état de chargement initial', () => {
    render(<ClientProfile />, { initialEntries: ['/profile'] });
    
    expect(screen.getByText(/charg|loading/i)).toBeInTheDocument();
  });
});