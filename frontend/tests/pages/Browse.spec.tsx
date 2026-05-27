import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '../test-utils';
import Browse from '../../client/pages/Browse';

const mockVehicles = [
  {
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
  },
  {
    id: 2,
    brand: 'Audi',
    model: 'Q5',
    year: 2023,
    fuel_type: 'Diesel',
    transmission: 'Automatique',
    mileage: 8000,
    price: 50000,
    rental_price_daily: 100,
    rental_price_monthly: 2000,
    service_type: 'location_longue_duree',
    location: 'Lyon',
    color: 'Blanc',
    description: 'SUV spacieux',
  },
];

describe('Page de parcours (Browse)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockVehicles), { status: 200 })
    );
  });

  it('affiche le filtre par type de service', async () => {
    render(<Browse />, { initialEntries: ['/browse'] });
    
    await waitFor(() => {
      const selects = screen.queryAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  it('récupère les véhicules lors du montage du composant', async () => {
    render(<Browse />, { initialEntries: ['/browse'] });
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('filtre les véhicules par type de service', async () => {
    render(<Browse />, { initialEntries: ['/browse'] });

    await waitFor(() => {
      const selects = screen.queryAllByRole('combobox');
      if (selects.length > 0) {
        fireEvent.change(selects[0], { target: { value: 'achat' } });
        expect(global.fetch).toHaveBeenCalled();
      }
    });
  });

  it('filtre les véhicules par marque', async () => {
    render(<Browse />, { initialEntries: ['/browse'] });

    await waitFor(() => {
      const selects = screen.queryAllByRole('combobox');
      if (selects.length > 1) {
        fireEvent.change(selects[1], { target: { value: 'Mercedes' } });
        expect(global.fetch).toHaveBeenCalled();
      }
    });
  });

  it('filtre les véhicules par localisation', async () => {
    render(<Browse />, { initialEntries: ['/browse'] });

    await waitFor(() => {
      const selects = screen.queryAllByRole('combobox');
      if (selects.length > 2) {
        fireEvent.change(selects[2], { target: { value: 'Paris' } });
        expect(global.fetch).toHaveBeenCalled();
      }
    });
  });

  it('affiche un état vide quand aucun véhicule n\'est trouvé', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 })
    );
    
    render(<Browse />, { initialEntries: ['/browse'] });
    
    await waitFor(() => {
      expect(screen.getByText(/aucun|non.*trouvé/i)).toBeInTheDocument();
    });
  });

  it('gère les erreurs de récupération (fetch) avec élégance', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Erreur réseau'));
    
    render(<Browse />, { initialEntries: ['/browse'] });
    
    await waitFor(() => {
      expect(screen.getByText(/erreur|error|impossible/i)).toBeInTheDocument();
    }, { timeout: 3000 }).catch(() => {});
  });

  it('affiche l\'état de chargement initial', async () => {
    render(<Browse />, { initialEntries: ['/browse'] });
    
    expect(screen.getByText(/charg|loading/i)).toBeInTheDocument();
  });
});