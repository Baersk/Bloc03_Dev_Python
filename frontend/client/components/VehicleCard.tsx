import { useNavigate } from "react-router-dom";
import { Star, Zap, Users, Gauge } from "lucide-react";

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
  status?: string;
}

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const navigate = useNavigate();
  const isVehicleSold = vehicle.status === "vendu";
  const isVehicleRented = vehicle.status === "loue";

  const handleViewDetails = () => {
    if (isVehicleSold) return;
    const params = new URLSearchParams({
      vehicle_id: vehicle.id.toString(),
      service_type: vehicle.service_type,
    });
    navigate(`/application?${params.toString()}`);
  };

  const priceDisplay =
    vehicle.service_type === "achat"
      ? `${vehicle.price.toLocaleString("fr-FR")} €`
      : vehicle.rental_price_monthly
        ? `${vehicle.rental_price_monthly.toLocaleString("fr-FR")} €/mois`
        : `${vehicle.rental_price_daily?.toLocaleString("fr-FR") || "N/A"} €/jour`;

  // Déterminer le badge et sa couleur
  const getBadgeStyles = () => {
    if (isVehicleSold) {
      return {
        container: "bg-red-100 text-red-800",
        text: "Vendu",
      };
    }
    if (isVehicleRented) {
      return {
        container: "bg-orange-100 text-orange-800",
        text: "Loué",
      };
    }
    return {
      container: "bg-blue-100 text-blue-800",
      text:
        vehicle.service_type === "achat"
          ? "Achat"
          : vehicle.service_type === "location_court_terme"
            ? "Location CT"
            : "Location LLD",
    };
  };

  const badge = getBadgeStyles();

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
      {/* Image Placeholder */}
      <div className="w-full h-48 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center relative overflow-hidden">
        <div className="text-white text-center">
          <div className="text-5xl mb-2">🚗</div>
          <p className="text-sm font-medium">
            {vehicle.brand} {vehicle.model}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Badge */}
        <div className="mb-3">
          <span
            className={`inline-block px-3 py-1 ${badge.container} text-xs font-medium rounded-full`}
          >
            {badge.text}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {vehicle.brand} {vehicle.model}
        </h3>
        <p className="text-sm text-gray-600 mb-3">{vehicle.year}</p>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {vehicle.description}
        </p>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div className="flex items-center text-gray-700">
            <Zap className="w-4 h-4 mr-1 text-yellow-500" />
            {vehicle.fuel_type}
          </div>
          <div className="flex items-center text-gray-700">
            <Gauge className="w-4 h-4 mr-1 text-blue-500" />
            {vehicle.transmission}
          </div>
          <div className="flex items-center text-gray-700">
            <Users className="w-4 h-4 mr-1 text-green-500" />
            {vehicle.color}
          </div>
          <div className="flex items-center text-gray-700">
            <Star className="w-4 h-4 mr-1 text-orange-500" />
            {vehicle.location}
          </div>
        </div>

        {/* Price */}
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <p className="text-2xl font-bold text-blue-600">{priceDisplay}</p>
          {vehicle.service_type !== "achat" && vehicle.rental_price_daily && (
            <p className="text-xs text-gray-600 mt-1">
              Ou {vehicle.rental_price_daily.toLocaleString("fr-FR")} €/jour
            </p>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleViewDetails}
          disabled={isVehicleSold}
          className={`w-full font-medium py-2 px-4 rounded-lg transition ${
            isVehicleSold
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isVehicleSold
            ? "Véhicule Vendu"
            : vehicle.service_type === "achat"
              ? "Consulter l'offre"
              : "Réserver maintenant"}
        </button>
      </div>
    </div>
  );
}