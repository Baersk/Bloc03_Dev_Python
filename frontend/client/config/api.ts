/**
 * Configuration API pour render
 */

const API_URL = 
  process.env.NODE_ENV === "production"
    ? "https://bloc03-dev-python.onrender.com"
    : "http://localhost:5000";

export const API_ENDPOINTS = {
  BASE: API_URL,
  
  // Auth
  LOGIN: `${API_URL}/api/auth/login`,
  REGISTER: `${API_URL}/api/auth/register`,
  PROFILE: `${API_URL}/api/auth/profile`,
  CHANGE_PASSWORD: `${API_URL}/api/auth/change-password`,
  
  // Vehicles
  VEHICLES: `${API_URL}/api/vehicles`,
  VEHICLE_BY_ID: (id: number) => `${API_URL}/api/vehicles/${id}`,
  
  // Applications
  APPLICATIONS: `${API_URL}/api/applications`,
  MY_APPLICATIONS: `${API_URL}/api/applications/my-applications`,
  APPLICATION_BY_ID: (id: number) => `${API_URL}/api/applications/${id}`,
  APPROVE_APPLICATION: (id: number) => `${API_URL}/api/applications/${id}/approve`,
  REJECT_APPLICATION: (id: number) => `${API_URL}/api/applications/${id}/reject`,
  CONFIRM_PAYMENT: (id: number) => `${API_URL}/api/applications/${id}/confirm-payment`,
  CLIENT_PAY_BALANCE: (id: number) => `${API_URL}/api/applications/${id}/client-pay-balance`,
  DOWNLOAD_INVOICE: (id: number) => `${API_URL}/api/applications/${id}/download-invoice`,
  LEVER_OPTION_ACHAT: (id: number) => `${API_URL}/api/applications/${id}/lever-option-achat`,
  
  // Health check
  HEALTH: `${API_URL}/api/health`,
};

export default API_ENDPOINTS;
