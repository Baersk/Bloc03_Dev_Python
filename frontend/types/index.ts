export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  fuel_type: string;
  transmission: string;
  mileage: number;
  price: number;
  rental_price_daily?: number;
  rental_price_monthly?: number;
  service_type: string;
  location: string;
  color: string;
  description?: string;
  status?: string;
}

export interface Application {
  id: number;
  user_id: number;
  vehicle_id: number;
  service_type: string;
  status: string;
  payment_status?: string;
  deposit_amount?: number;
  total_amount?: number;
  payment_method?: string;
  invoice_number?: string;
  created_at: string;
  paid_at?: string;
  confirmed_at?: string;
  user?: {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
  };
  vehicle?: Vehicle;
  driving_license_number?: string;
  admin_notes?: string;
  package_included?: boolean;
  notes?: string; 
  option_achat_active?: boolean;
  valeur_residuelle?: number;
  option_achat_levee?: boolean;
  date_levee_option?: string;
}

export interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  is_admin?: boolean; 
}