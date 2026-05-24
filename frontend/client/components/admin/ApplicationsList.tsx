import { Eye, FileText } from "lucide-react";
import { Application } from "@/types";

interface ApplicationsListProps {
  applications: Application[];
  loading: boolean;
  onViewDetails: (app: Application) => void;
}

export default function ApplicationsList({
  applications,
  loading,
  onViewDetails,
}: ApplicationsListProps) {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Gestion des Dossiers
        </h2>
        <p className="text-gray-600 mt-1">
          {applications.length} dossier(s) à traiter
        </p>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Chargement...</p>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucun dossier trouvé</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Véhicule
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Acompte
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Paiement
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
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">
                        {app.user?.firstname} {app.user?.lastname}
                      </div>
                      <div className="text-xs text-gray-500">
                        {app.user?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {app.vehicle?.brand} {app.vehicle?.model}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {app.service_type === "achat"
                          ? "🛒 Achat"
                          : app.service_type === "location_court_terme"
                            ? "📅 CT"
                            : "📆 LLD"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                      {app.deposit_amount
                        ? `${app.deposit_amount.toLocaleString("fr-FR")} €`
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            app.status === "refuse"
                              ? "bg-red-100 text-red-800"
                              : app.payment_status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : app.payment_status === "paid"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {app.status === "refuse"
                            ? "🚫 Annulé"
                            : app.payment_status === "confirmed"
                              ? "✓ Confirmé"
                              : app.payment_status === "paid"
                                ? "💳 Payé"
                                : "⏳ En attente"}
                        </span>
                        {app.payment_method && app.status !== "refuse" && (
                          <span className="text-xs text-gray-500">
                            {app.payment_method === "credit"
                              ? "💳 Carte"
                              : "🏦 Virement"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          app.status === "nouveau"
                            ? "bg-yellow-100 text-yellow-800"
                            : app.status === "accepte" ||
                              app.status === "complete"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {app.status === "nouveau"
                          ? "📋 Nouveau"
                          : app.status === "accepte"
                            ? "✓ Accepté"
                            : app.status === "complete"
                              ? "✓ Complet"
                              : "✗ Refusé"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => onViewDetails(app)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Détails
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
