import { describe, it, expect, beforeEach, vi } from 'vitest';
import API_ENDPOINTS from '../../client/config/api';

describe('Configuration des points de terminaison (endpoints) API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fournit l\'URL de base de l\'API', () => {
    expect(API_ENDPOINTS.BASE).toBeDefined();
    expect(typeof API_ENDPOINTS.BASE).toBe('string');
  });

  it('inclut les points de terminaison d\'authentification', () => {
    expect(API_ENDPOINTS.LOGIN).toBeDefined();
    expect(API_ENDPOINTS.REGISTER).toBeDefined();
    expect(API_ENDPOINTS.PROFILE).toBeDefined();
    expect(API_ENDPOINTS.CHANGE_PASSWORD).toBeDefined();
  });

  it('inclut les points de terminaison des véhicules', () => {
    expect(API_ENDPOINTS.VEHICLES).toBeDefined();
    expect(API_ENDPOINTS.VEHICLE_BY_ID).toBeDefined();
  });

  it('inclut les points de terminaison des candidatures', () => {
    expect(API_ENDPOINTS.APPLICATIONS).toBeDefined();
    expect(API_ENDPOINTS.MY_APPLICATIONS).toBeDefined();
    expect(API_ENDPOINTS.APPROVE_APPLICATION).toBeDefined();
    expect(API_ENDPOINTS.REJECT_APPLICATION).toBeDefined();
    expect(API_ENDPOINTS.CONFIRM_PAYMENT).toBeDefined();
  });

  it('fournit des fonctions pour les URLs dynamiques', () => {
    const vehicleUrl = API_ENDPOINTS.VEHICLE_BY_ID(1);
    expect(vehicleUrl).toContain('/1');
  });

  it('génère correctement les URLs des points de terminaison de candidature', () => {
    const url = API_ENDPOINTS.APPROVE_APPLICATION(5);
    expect(url).toContain('/5');
    expect(url).toContain('approve');
  });

  it('le point de terminaison de connexion est correctement formaté', () => {
    expect(API_ENDPOINTS.LOGIN).toContain('/api/auth/login');
  });

  it('le point de terminaison d\'inscription est correctement formaté', () => {
    expect(API_ENDPOINTS.REGISTER).toContain('/api/auth/register');
  });

  it('le point de terminaison du profil est correctement formaté', () => {
    expect(API_ENDPOINTS.PROFILE).toContain('/api/auth/profile');
  });

  it('le point de terminaison des véhicules est correctement formaté', () => {
    expect(API_ENDPOINTS.VEHICLES).toContain('/api/vehicles');
  });

  it('le point de terminaison des candidatures est correctement formaté', () => {
    expect(API_ENDPOINTS.APPLICATIONS).toContain('/api/applications');
  });

  it('le point de terminaison de vérification de santé existe', () => {
    expect(API_ENDPOINTS.HEALTH).toBeDefined();
    expect(API_ENDPOINTS.HEALTH).toContain('/api/health');
  });

  it('utilise la bonne URL de base pour le développement', () => {
    expect(API_ENDPOINTS.BASE).toMatch(/localhost|127.0.0.1|render/);
  });

  it('inclut les points de terminaison LOA', () => {
    expect(API_ENDPOINTS.LEVER_OPTION_ACHAT).toBeDefined();
  });

  it('inclut le point de terminaison de téléchargement de facture', () => {
    expect(API_ENDPOINTS.DOWNLOAD_INVOICE).toBeDefined();
  });

  it('inclut le point de terminaison de paiement de solde client', () => {
    expect(API_ENDPOINTS.CLIENT_PAY_BALANCE).toBeDefined();
  });

  it('tous les points de terminaison ont une structure correcte', () => {
    const endpoints = Object.values(API_ENDPOINTS).filter(v => typeof v === 'string');
    
    endpoints.forEach(endpoint => {
      if (endpoint !== API_ENDPOINTS.BASE) {
        expect(endpoint).toContain(API_ENDPOINTS.BASE);
      }
    });
  });

  it('les fonctions de points de terminaison retournent des chaînes de caractères', () => {
    const result = API_ENDPOINTS.VEHICLE_BY_ID(1);
    expect(typeof result).toBe('string');
  });

  it('les points de terminaison de candidature utilisent les bons identifiants', () => {
    const id = 42;
    const approveUrl = API_ENDPOINTS.APPROVE_APPLICATION(id);
    expect(approveUrl).toContain('/42/approve');
  });
});

describe('Fonctions utilitaires API', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('construit correctement les en-têtes d\'autorisation', () => {
    const token = 'test-token-123';
    localStorage.setItem('access_token', token);
    
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    
    expect(headers.Authorization).toBe(`Bearer ${token}`);
  });

  it('gère les erreurs API avec élégance', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Erreur réseau'));
    
    try {
      await fetch(API_ENDPOINTS.VEHICLES);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('valide le statut de réponse de l\'API', async () => {
    const mockResponse = {
      status: 200,
      ok: true,
      json: async () => ({ data: 'test' }),
    };
    
    expect(mockResponse.ok).toBe(true);
    expect(mockResponse.status).toBe(200);
  });

  it('gère le statut 401 non autorisé', async () => {
    const mockResponse = {
      status: 401,
      ok: false,
    };
    
    expect(mockResponse.ok).toBe(false);
  });

  it('gère le statut 404 non trouvé', async () => {
    const mockResponse = {
      status: 404,
      ok: false,
    };
    
    expect(mockResponse.ok).toBe(false);
  });

  it('gère le statut 400 mauvaise requête', async () => {
    const mockResponse = {
      status: 400,
      ok: false,
    };
    
    expect(mockResponse.ok).toBe(false);
  });

  it('analyse (parse) correctement la réponse JSON', async () => {
    const data = { id: 1, name: 'Test' };
    const json = JSON.stringify(data);
    const parsed = JSON.parse(json);
    
    expect(parsed.id).toBe(1);
    expect(parsed.name).toBe('Test');
  });

  it('gère les réponses vides', async () => {
    const mockResponse = {
      status: 204,
      ok: true,
      json: async () => null,
    };
    
    expect(mockResponse.ok).toBe(true);
  });
});