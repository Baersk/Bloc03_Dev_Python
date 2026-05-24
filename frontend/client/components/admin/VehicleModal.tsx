import { X, Save } from "lucide-react";
import { Vehicle } from "@/types";

interface VehicleModalProps {
  isOpen: boolean;
  isEditing: boolean;
  vehicleForm: Partial<Vehicle>;
  onVehicleFormChange: (form: Partial<Vehicle>) => void;
  onSave: () => void;
  onClose: () => void;
}

export default function VehicleModal({
  isOpen,
  isEditing,
  vehicleForm,
  onVehicleFormChange,
  onSave,
  onClose,
}: VehicleModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold">
            {isEditing ? "Modifier le véhicule" : "Ajouter un véhicule"}
          </h3>
          <button
            onClick={onClose}
            className="hover:bg-blue-800 p-1 rounded"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={vehicleForm.brand || ""}
              onChange={(e) =>
                onVehicleFormChange({ ...vehicleForm, brand: e.target.value })
              }
              placeholder="Marque"
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={vehicleForm.model || ""}
              onChange={(e) =>
                onVehicleFormChange({ ...vehicleForm, model: e.target.value })
              }
              placeholder="Modèle"
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <input
              type="number"
              value={vehicleForm.year || ""}
              onChange={(e) =>
                onVehicleFormChange({
                  ...vehicleForm,
                  year: parseInt(e.target.value),
                })
              }
              placeholder="Année"
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={vehicleForm.color || ""}
              onChange={(e) =>
                onVehicleFormChange({ ...vehicleForm, color: e.target.value })
              }
              placeholder="Couleur"
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={vehicleForm.fuel_type || ""}
              onChange={(e) =>
                onVehicleFormChange({
                  ...vehicleForm,
                  fuel_type: e.target.value,
                })
              }
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option>Essence</option>
              <option>Diesel</option>
              <option>Hybride</option>
              <option>Électrique</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <select
              value={vehicleForm.transmission || ""}
              onChange={(e) =>
                onVehicleFormChange({
                  ...vehicleForm,
                  transmission: e.target.value,
                })
              }
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option>Automatique</option>
              <option>Manuelle</option>
            </select>
            <input
              type="number"
              value={vehicleForm.mileage || ""}
              onChange={(e) =>
                onVehicleFormChange({
                  ...vehicleForm,
                  mileage: parseInt(e.target.value),
                })
              }
              placeholder="Kilométrage"
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <input
              type="number"
              value={vehicleForm.price || ""}
              onChange={(e) =>
                onVehicleFormChange({
                  ...vehicleForm,
                  price: parseFloat(e.target.value),
                })
              }
              placeholder="Prix"
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              value={vehicleForm.rental_price_daily || ""}
              onChange={(e) =>
                onVehicleFormChange({
                  ...vehicleForm,
                  rental_price_daily: parseFloat(e.target.value),
                })
              }
              placeholder="Prix/jour"
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              value={vehicleForm.rental_price_monthly || ""}
              onChange={(e) =>
                onVehicleFormChange({
                  ...vehicleForm,
                  rental_price_monthly: parseFloat(e.target.value),
                })
              }
              placeholder="Prix/mois"
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <select
              value={vehicleForm.service_type || ""}
              onChange={(e) =>
                onVehicleFormChange({
                  ...vehicleForm,
                  service_type: e.target.value,
                })
              }
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="achat">Achat</option>
              <option value="location_court_terme">Location CT</option>
              <option value="location_longue_duree">Location LLD</option>
            </select>
            <input
              type="text"
              value={vehicleForm.location || ""}
              onChange={(e) =>
                onVehicleFormChange({
                  ...vehicleForm,
                  location: e.target.value,
                })
              }
              placeholder="Location"
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={vehicleForm.status || ""}
              onChange={(e) =>
                onVehicleFormChange({ ...vehicleForm, status: e.target.value })
              }
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="disponible">Disponible</option>
              <option value="loue">Loué</option>
              <option value="vendu">Vendu</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <textarea
            value={vehicleForm.description || ""}
            onChange={(e) =>
              onVehicleFormChange({
                ...vehicleForm,
                description: e.target.value,
              })
            }
            rows={3}
            placeholder="Description"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Annuler
          </button>
          <button
            onClick={onSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isEditing ? "Modifier" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}
