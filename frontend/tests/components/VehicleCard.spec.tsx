import { screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '../test-utils';
import VehicleCard from '../../client/components/VehicleCard';

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
  description: 'Berline élégante et performante',
};

describe('Composant VehicleCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche correctement les informations du véhicule', () => {
    render(<VehicleCard vehicle={mockVehicle} />);
    
    expect(screen.getByRole('heading', { name: /Mercedes C-Class/i, level: 3 })).toBeInTheDocument();
    expect(screen.getByText(/2024/i)).toBeInTheDocument();
    expect(screen.getByText(/Berline élégante/i)).toBeInTheDocument();
  });

  it('affiche correctement le prix pour un achat', () => {
    render(<VehicleCard vehicle={mockVehicle} />);
    expect(screen.getByText(/45\s?000\s?€/i)).toBeInTheDocument();
  });

  it('affiche les spécifications du véhicule', () => {
    render(<VehicleCard vehicle={mockVehicle} />);
    expect(screen.getByText(/Essence/i)).toBeInTheDocument();
    expect(screen.getByText(/Automatique/i)).toBeInTheDocument();
    expect(screen.getByText(/Noir/i)).toBeInTheDocument();
    expect(screen.getByText(/Paris/i)).toBeInTheDocument();
  });

  it('affiche le texte du bouton approprié selon le type de service', () => {
    const { rerender } = render(<VehicleCard vehicle={mockVehicle} />);
    expect(screen.getByRole('button', { name: /Consulter l'offre/i })).toBeInTheDocument();

    const rentalVehicle = { ...mockVehicle, service_type: 'location_court_terme' };
    rerender(<VehicleCard vehicle={rentalVehicle} />);
    expect(screen.getByRole('button', { name: /Réserver maintenant/i })).toBeInTheDocument();
  });

  it('désactive le bouton lorsque le véhicule est vendu', () => {
    const soldVehicle = { ...mockVehicle, status: 'vendu' };
    render(<VehicleCard vehicle={soldVehicle} />);
    const button = screen.getByRole('button', { name: /Véhicule Vendu/i });
    expect(button).toBeDisabled();
  });
});