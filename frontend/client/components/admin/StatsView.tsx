import { Vehicle, Application } from "@/types";

interface StatsViewProps {
  vehicles: Vehicle[];
  applications: Application[];
}

export default function StatsView({ vehicles, applications }: StatsViewProps) {
  const availableVehicles = vehicles.filter(
    (v) => v.status === "disponible"
  ).length;
  const pendingApplications = applications.filter(
    (a) => a.status === "nouveau" || a.status === "en_attente"
  ).length;
  const approvedApplications = applications.filter(
    (a) => a.status === "accepte"
  ).length;

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Statistiques
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">
            Véhicules Disponibles
          </p>
          <p className="text-4xl font-bold text-green-600 mt-2">
            {availableVehicles}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">
            Dossiers en Attente
          </p>
          <p className="text-4xl font-bold text-yellow-600 mt-2">
            {pendingApplications}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">
            Dossiers Approuvés
          </p>
          <p className="text-4xl font-bold text-blue-600 mt-2">
            {approvedApplications}
          </p>
        </div>
      </div>
    </div>
  );
}
