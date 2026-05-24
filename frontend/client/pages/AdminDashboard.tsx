import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import VehiclesList from "@/components/admin/VehiclesList";
import ApplicationsList from "@/components/admin/ApplicationsList";
import StatsView from "@/components/admin/StatsView";
import HistoryView from "@/components/admin/HistoryView";
import VehicleModal from "@/components/admin/VehicleModal";
import ApplicationModal from "@/components/admin/ApplicationModal";
import { X } from "lucide-react";
import { Vehicle, Application } from "../../types";
import API_ENDPOINTS from "@/config/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"vehicles" | "applications" | "stats" | "history">("vehicles");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal states
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const [vehicleForm, setVehicleForm] = useState<Partial<Vehicle>>({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    fuel_type: "Essence",
    transmission: "Automatique",
    mileage: 0,
    price: 0,
    rental_price_daily: 0,
    rental_price_monthly: 0,
    service_type: "achat",
    location: "Paris",
    color: "",
    description: "",
    status: "disponible",
  });

  const [adminReview, setAdminReview] = useState({
    admin_notes: "",
    action: "",
  });

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  function checkAuth() {
    const token = localStorage.getItem("access_token");
    const userStr = localStorage.getItem("user");

    if (!token) {
      navigate("/signup");
      return;
    }

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (!user.is_admin) {
          setError("Accès refusé: Vous n'avez pas les droits d'administrateur");
          setTimeout(() => {
            navigate("/");
          }, 2000);
          return;
        }
      } catch (err) {
        console.error("Erreur lors de la vérification admin", err);
        navigate("/signup");
        return;
      }
    } else {
      navigate("/signup");
    }
  }

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");

      const vehiclesRes = await fetch(API_ENDPOINTS.VEHICLES);
      if (!vehiclesRes.ok) throw new Error(`Erreur véhicules: ${vehiclesRes.status}`);

      let vehiclesData;
      try {
        vehiclesData = await vehiclesRes.json();
      } catch {
        throw new Error("Réponse serveur invalide pour les véhicules");
      }

      const vehiclesList = vehiclesData.vehicles || (Array.isArray(vehiclesData) ? vehiclesData : []);
      setVehicles(vehiclesList);

      const appsRes = await fetch(API_ENDPOINTS.APPLICATIONS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!appsRes.ok) throw new Error(`Erreur dossiers: ${appsRes.status}`);

      let applicationsData;
      try {
        applicationsData = await appsRes.json();
      } catch {
        throw new Error("Réponse serveur invalide pour les dossiers");
      }

      const appsList = applicationsData.applications || (Array.isArray(applicationsData) ? applicationsData : []);
      setApplications(appsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  // Vehicle CRUD Functions
  async function handleSaveVehicle() {
    try {
      const token = localStorage.getItem("access_token");

      if (!vehicleForm.brand || !vehicleForm.model || !vehicleForm.year || !vehicleForm.price) {
        setError("Les champs Marque, Modèle, Année et Prix sont obligatoires");
        return;
      }

      const endpoint = editingVehicleId
        ? API_ENDPOINTS.VEHICLE_BY_ID(editingVehicleId)
        : API_ENDPOINTS.VEHICLES;
      const method = editingVehicleId ? "PUT" : "POST";

      const { id, ...cleanedVehicleData } = vehicleForm;

      const sanitizedData = {
        brand: String(cleanedVehicleData.brand || ""),
        model: String(cleanedVehicleData.model || ""),
        year: Number(cleanedVehicleData.year) || new Date().getFullYear(),
        fuel_type: String(cleanedVehicleData.fuel_type || "Essence"),
        transmission: String(cleanedVehicleData.transmission || "Automatique"),
        mileage: Number(cleanedVehicleData.mileage) || 0,
        price: Number(cleanedVehicleData.price) || 0,
        rental_price_daily: Number(cleanedVehicleData.rental_price_daily) || 0,
        rental_price_monthly: Number(cleanedVehicleData.rental_price_monthly) || 0,
        service_type: String(cleanedVehicleData.service_type || "achat"),
        location: String(cleanedVehicleData.location || "Paris"),
        color: String(cleanedVehicleData.color || ""),
        description: String(cleanedVehicleData.description || ""),
        status: String(cleanedVehicleData.status || "disponible"),
      };

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sanitizedData),
      });

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // 
        }
        throw new Error(errorMessage);
      }

      try {
        await response.json();
      } catch {
        throw new Error("Réponse serveur invalide");
      }

      setSuccessMsg(
        editingVehicleId
          ? "✓ Véhicule modifié avec succès!"
          : "✓ Véhicule ajouté avec succès!"
      );
      setTimeout(() => setSuccessMsg(""), 3000);

      setShowVehicleModal(false);
      resetVehicleForm();
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }

  async function handleDeleteVehicle(vehicleId: number) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce véhicule?")) return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(API_ENDPOINTS.VEHICLE_BY_ID(vehicleId), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // 
        }
        throw new Error(errorMessage);
      }

      setSuccessMsg("✓ Véhicule supprimé avec succès!");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  }

  // Application Review Functions
  async function handleReviewApplication(action: "approve" | "reject" | "confirm") {
    if (!selectedApplication) return;

    try {
      const token = localStorage.getItem("access_token");
      let endpoint = "";

      if (action === "approve") {
        endpoint = API_ENDPOINTS.APPROVE_APPLICATION(selectedApplication.id);
      } else if (action === "reject") {
        endpoint = API_ENDPOINTS.REJECT_APPLICATION(selectedApplication.id);
      } else if (action === "confirm") {
        endpoint = API_ENDPOINTS.CONFIRM_PAYMENT(selectedApplication.id);
      }

      const requestBody = { admin_notes: adminReview.admin_notes };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // 
        }
        throw new Error(errorMessage);
      }

      let responseData;
      try {
        responseData = await response.json();
      } catch {
        throw new Error("Réponse serveur invalide");
      }

      const updatedApplication = responseData.application || responseData;

      setApplications(applications.map(app =>
        app.id === selectedApplication.id
          ? updatedApplication
          : app
      ));

      setSuccessMsg(
        action === "approve"
          ? "✓ Dossier approuvé avec succès!"
          : action === "reject"
            ? "✗ Dossier rejeté"
            : "✓ Paiement confirmé - Facture générée!"
      );
      setTimeout(() => setSuccessMsg(""), 3000);

      setShowApplicationModal(false);
      setSelectedApplication(null);
      setAdminReview({ admin_notes: "", action: "" });

      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }

  function resetVehicleForm() {
    setVehicleForm({
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      fuel_type: "Essence",
      transmission: "Automatique",
      mileage: 0,
      price: 0,
      rental_price_daily: 0,
      rental_price_monthly: 0,
      service_type: "achat",
      location: "Paris",
      color: "",
      description: "",
      status: "disponible",
    });
    setEditingVehicleId(null);
  }

  function openEditVehicle(vehicle: Vehicle) {
    setVehicleForm(vehicle);
    setEditingVehicleId(vehicle.id);
    setShowVehicleModal(true);
  }

  function openApplicationModal(app: Application) {
    setSelectedApplication(app);
    setAdminReview({ admin_notes: "", action: "" });
    setShowApplicationModal(true);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      {/* Header with Horizontal Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 py-4">
              Tableau de Bord Admin
            </h1>

            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("vehicles")}
                className={`px-4 py-4 font-medium transition-all whitespace-nowrap relative border-b-[3px] ${activeTab === "vehicles"
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-600 hover:text-gray-900 border-b-[3px] border-transparent"
                  }`}
              >
                📦 Véhicules ({vehicles.length})
              </button>
              <button
                onClick={() => setActiveTab("applications")}
                className={`px-4 py-4 font-medium transition-all whitespace-nowrap relative border-b-[3px] ${activeTab === "applications"
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-600 hover:text-gray-900 border-b-[3px] border-transparent"
                  }`}
              >
                📋 Dossiers ({applications.length})
              </button>
              <button
                onClick={() => setActiveTab("stats")}
                className={`px-4 py-4 font-medium transition-all whitespace-nowrap relative border-b-[3px] ${activeTab === "stats"
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-600 hover:text-gray-900 border-b-[3px] border-transparent"
                  }`}
              >
                📊 Statistiques
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-4 font-medium transition-all whitespace-nowrap relative border-b-[3px] ${activeTab === "history"
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-600 hover:text-gray-900 border-b-[3px] border-transparent"
                  }`}
              >
                📜 Historique
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 m-6 rounded-lg flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError("")} className="text-red-600">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 m-6 rounded-lg flex justify-between items-center">
              <span>{successMsg}</span>
              <button onClick={() => setSuccessMsg("")} className="text-green-600">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {activeTab === "vehicles" && (
              <VehiclesList
                vehicles={vehicles}
                loading={loading}
                onAdd={() => {
                  resetVehicleForm();
                  setShowVehicleModal(true);
                }}
                onEdit={openEditVehicle}
                onDelete={handleDeleteVehicle}
              />
            )}

            {activeTab === "applications" && (
              <ApplicationsList
                applications={applications}
                loading={loading}
                onViewDetails={openApplicationModal}
              />
            )}

            {activeTab === "stats" && (
              <StatsView vehicles={vehicles} applications={applications} />
            )}

            {activeTab === "history" && (
              <HistoryView applications={applications} />
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Modal */}
      {showVehicleModal && (
        <VehicleModal
          isOpen={showVehicleModal}
          isEditing={editingVehicleId !== null}
          vehicleForm={vehicleForm}
          onVehicleFormChange={setVehicleForm}
          onSave={handleSaveVehicle}
          onClose={() => {
            setShowVehicleModal(false);
            resetVehicleForm();
          }}
        />
      )}

      {/* Application Modal */}
      {showApplicationModal && selectedApplication && (
        <ApplicationModal
          isOpen={showApplicationModal}
          application={selectedApplication}
          adminReview={adminReview}
          onAdminReviewChange={setAdminReview}
          onApprove={() => handleReviewApplication("approve")}
          onReject={() => handleReviewApplication("reject")}
          onConfirmPayment={() => handleReviewApplication("confirm")}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedApplication(null);
            setAdminReview({ admin_notes: "", action: "" });
          }}
        />
      )}
    </div>
  );
}
