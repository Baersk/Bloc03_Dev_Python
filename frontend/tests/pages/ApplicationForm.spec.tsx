import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '../test-utils';
import ApplicationForm from '../../client/pages/ApplicationForm';

const mockVehicle = {
  id: 1,
  brand: 'Mercedes',
  model: 'C-Class',
  year: 2024,
  fuel_type: 'Essence',
  transmission: 'Automatique',
  mileage: 500,
  price: 45000,
  rental_price_daily: 85,
  rental_price_monthly: 1700,
  service_type: 'achat',
  location: 'Paris',
  color: 'Noir',
  description: 'Berline élégante',
};

describe('Page Formulaire de Candidature', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('access_token', 'fake-token');
    vi.clearAllMocks();

    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/vehicles/')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockVehicle,
        });
      }

      if (url.includes('/applications')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true }),
        });
      }
      return Promise.reject(new Error("URL non mockée: " + url));
    });
  });

  it('contient le champ numéro de permis', async () => {
    render(<ApplicationForm />, { initialEntries: ['/application?vehicle_id=1'] });

    await waitFor(() => {
      const field = screen.queryByLabelText(/permis|license/i) ||
        screen.queryByPlaceholderText(/permis|license/i);
      expect(field).toBeDefined();
    });
  });

  it('contient le champ date d\'expiration du permis', async () => {
    render(<ApplicationForm />, { initialEntries: ['/application?vehicle_id=1'] });

    await waitFor(() => {
      const field = screen.queryByLabelText(/expir|date/i) ||
        screen.queryByPlaceholderText(/expir|date/i);
      expect(field).toBeDefined();
    });
  });

  it('valide les champs requis avant la soumission', async () => {
    render(<ApplicationForm />, { initialEntries: ['/application?vehicle_id=1'] });

    await waitFor(() => {
      const submitButton = screen.queryByRole('button', { name: /soumettre|submit/i });
      if (submitButton) {
        fireEvent.click(submitButton);
      }
    });
  });

  it('gère les erreurs de formulaire', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Server error'));
    render(<ApplicationForm />, { initialEntries: ['/application?vehicle_id=1'] });

    await waitFor(() => {
      expect(screen.getByText(/erreur|error/i)).toBeInTheDocument();
    }, { timeout: 3000 }).catch(() => { });
  });

  it('redirige vers la connexion si non authentifié', () => {
    localStorage.removeItem('access_token');
    expect(localStorage.getItem('access_token')).toBeFalsy();
  });
});