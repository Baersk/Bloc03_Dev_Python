import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import VehicleCard from "@/components/VehicleCard";
import { ChevronDown } from "lucide-react";
import API_ENDPOINTS from "@/config/api";

interface Vehicle {
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
  description: string;
}

export default function Browse() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceType, setServiceType] = useState("location_longue_duree");
  const [brand, setBrand] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const brands = [
    "Mercedes",
    "Audi",
    "Peugeot",
    "BMW",
    "Volkswagen",
    "Renault",
  ];
  const locations = ["Paris", "Lyon", "Marseille", "Toulouse", "Bordeaux"];

  useEffect(() => {
    fetchVehicles();
  }, [serviceType, brand, location, minPrice, maxPrice]);

  async function fetchVehicles() {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (serviceType) params.append("service_type", serviceType);
      if (brand) params.append("brand", brand);
      if (location) params.append("location", location);
      if (minPrice) params.append("min_price", minPrice);
      if (maxPrice) params.append("max_price", maxPrice);

      const response = await fetch(
        `${API_ENDPOINTS.VEHICLES}${params.toString() ? "?" + params.toString() : ""}`
      );
      if (!response.ok) throw new Error(`Erreur ${response.status}`);

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Réponse serveur invalide");
      }
      setVehicles(Array.isArray(data) ? data : (data.vehicles || []));
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Parcourir nos véhicules
            </h1>
            <p className="text-lg text-gray-600">
              Trouvez le véhicule parfait pour vos besoins
            </p>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de service
              </label>
              <div className="relative">
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full appearance-none px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="location_longue_duree">
                    Location longue durée
                  </option>
                  <option value="location_court_terme">
                    Location court terme
                  </option>
                  <option value="achat">Achat</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marque
              </label>
              <div className="relative">
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full appearance-none px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les marques</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localisation
              </label>
              <div className="relative">
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full appearance-none px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les locations</option>
                  {locations.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Min Prix */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix min (€)
              </label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Max Prix */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix max (€)
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="999999"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Réinitialisation */}
          <div className="mb-8">
            <button
              onClick={() => {
                setServiceType("location_longue_duree");
                setBrand("");
                setLocation("");
                setMinPrice("");
                setMaxPrice("");
              }}
              className="px-6 py-2 border-2 border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition"
            >
              Réinitialiser
            </button>
          </div>

          {/* Grid Véhicules */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Chargement des véhicules...</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                Aucun véhicule ne correspond à vos critères
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
