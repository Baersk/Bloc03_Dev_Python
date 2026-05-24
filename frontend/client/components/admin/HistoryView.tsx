import { Application } from "@/types";

interface HistoryViewProps {
  applications: Application[];
}

export default function HistoryView({ applications }: HistoryViewProps) {
  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Historique des Transactions
      </h2>

      {applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">Aucun dossier pour l'historique</p>
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
                    Acompte
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Paiement
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Statut
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
                    <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                      {app.deposit_amount
                        ? app.deposit_amount.toLocaleString("fr-FR")
                        : "0"}{" "}
                      €
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      {app.total_amount
                        ? app.total_amount.toLocaleString("fr-FR")
                        : "0"}{" "}
                      €
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          app.status === "refuse"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {app.status === "refuse"
                          ? "N/A"
                          : app.payment_method === "credit"
                            ? "💳 Carte"
                            : app.payment_method === "transfer"
                              ? "🏦 Virement"
                              : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
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