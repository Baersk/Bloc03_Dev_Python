import { Plus, Edit2, Trash2 } from "lucide-react";
import { Vehicle } from "@/types";

interface VehiclesListProps {
  vehicles: Vehicle[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicleId: number) => void;
}

export default function VehiclesList({
  vehicles,
  loading,
  onAdd,
  onEdit,
  onDelete,
}: VehiclesListProps) {
  return (
    <div className="w-full">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Gestion des Véhicules
          </h2>
          <p className="text-gray-600 mt-1">
            Vous avez {vehicles.length} véhicule(s)
          </p>
        </div>
        <button
          onClick={onAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition"
        >
          <Plus className="w-5 h-5" />
          Ajouter
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Chargement...</p>
      ) : vehicles.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 mb-6">Aucun véhicule trouvé</p>
          <button
            onClick={onAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            ➕ Ajouter le premier
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Marque & Modèle
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Prix
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">
                      {vehicle.brand} {vehicle.model}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      {vehicle.price.toLocaleString("fr-FR")} €
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {vehicle.service_type === "achat"
                          ? "🛒 Achat"
                          : vehicle.service_type === "location_court_terme"
                            ? "📅 CT"
                            : "📆 LLD"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          vehicle.status === "disponible"
                            ? "bg-green-100 text-green-800"
                            : vehicle.status === "loue"
                              ? "bg-yellow-100 text-yellow-800"
                              : vehicle.status === "vendu"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {vehicle.status === "disponible"
                          ? "✓ Libre"
                          : vehicle.status === "loue"
                            ? "⏳ Loué"
                            : vehicle.status === "vendu"
                              ? "✓ Vendu"
                              : "🔧 Maintenance"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-3">
                      <button
                        onClick={() => onEdit(vehicle)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(vehicle.id)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}