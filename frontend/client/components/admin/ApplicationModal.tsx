import { X, CheckCircle, XCircle } from "lucide-react";
import { Application } from "@/types";

interface ApplicationModalProps {
  isOpen: boolean;
  application: Application;
  adminReview: {
    admin_notes: string;
    action: string;
  };
  onAdminReviewChange: (review: { admin_notes: string; action: string }) => void;
  onApprove: () => void;
  onReject: () => void;
  onConfirmPayment: () => void;
  onClose: () => void;
}

export default function ApplicationModal({
  isOpen,
  application,
  adminReview,
  onAdminReviewChange,
  onApprove,
  onReject,
  onConfirmPayment,
  onClose,
}: ApplicationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold">
            Dossier #{application.id}
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
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Client</p>
              <p className="font-bold text-gray-900 mt-1">
                {application.user?.firstname} {application.user?.lastname}
              </p>
              <p className="text-sm text-gray-600">
                {application.user?.email}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Véhicule</p>
              <p className="font-bold text-gray-900 mt-1">
                {application.vehicle?.brand} {application.vehicle?.model}
              </p>
              <p className="text-sm text-gray-600">
                {application.vehicle?.year}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${
              application.status === "refuse"
                ? "bg-red-50 border border-red-200"
                : application.status === "accepte" || application.status === "complete"
                  ? "bg-green-50 border border-green-200"
                  : "bg-gray-50"
            }`}>
              <p className={`text-sm ${
                application.status === "refuse"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}>Statut Dossier</p>
              <p className={`text-lg font-bold mt-2 ${
                application.status === "refuse"
                  ? "text-red-700"
                  : application.status === "accepte" || application.status === "complete"
                    ? "text-green-700"
                    : "text-gray-900"
              }`}>
                {application.status === "nouveau"
                  ? "📋 Nouveau"
                  : application.status === "accepte"
                    ? "✓ Accepté"
                    : application.status === "complete"
                      ? "✓ Complet"
                      : "✗ Refusé"}
              </p>
            </div>
            <div className={`p-4 rounded-lg border ${
              application.status === "refuse"
                ? "bg-red-50 border-red-200"
                : application.payment_status === "confirmed"
                  ? "bg-green-50 border-green-200"
                  : "bg-blue-50 border-blue-200"
            }`}>
              <p className={`text-sm ${
                application.status === "refuse"
                  ? "text-red-600"
                  : application.payment_status === "confirmed"
                    ? "text-green-600"
                    : "text-blue-600"
              }`}>Statut Paiement</p>
              <p className={`text-lg font-bold mt-2 ${
                application.status === "refuse"
                  ? "text-red-700"
                  : application.payment_status === "confirmed"
                    ? "text-green-700"
                    : "text-blue-700"
              }`}>
                {application.status === "refuse"
                  ? "🚫 Dossier Rejeté - Paiement Annulé"
                  : application.payment_status === "confirmed"
                    ? "✓ Confirmé"
                    : application.payment_status === "paid"
                      ? "💳 Payé"
                      : "⏳ En attente"}
              </p>
            </div>
          </div>

          {application.status === "refuse" && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
              <p className="text-sm font-bold text-red-900 mb-2">⚠️ Dossier Rejeté</p>
              <p className="text-sm text-red-800 mb-3">
                Ce dossier a été rejeté. Le client en a été notifié. Aucune action supplémentaire n'est possible.
              </p>
              {application.admin_notes && (
                <div className="bg-red-100 p-2 rounded border border-red-200">
                  <p className="text-xs text-red-700 font-semibold mb-1">Raison du rejet:</p>
                  <p className="text-sm text-red-800">{application.admin_notes}</p>
                </div>
              )}
            </div>
          )}

          {application.status !== "refuse" && (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-gray-900">Informations Paiement</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-gray-600">Acompte</p>
                    <p className="font-bold text-gray-900">
                      {application.deposit_amount
                        ? `${application.deposit_amount.toLocaleString("fr-FR")} €`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total</p>
                    <p className="font-bold text-gray-900">
                      {application.total_amount
                        ? `${application.total_amount.toLocaleString("fr-FR")} €`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Méthode</p>
                    <p className="font-bold text-gray-900">
                      {application.payment_method === "credit"
                        ? "💳 Carte"
                        : application.payment_method === "transfer"
                          ? "🏦 Virement"
                          : "N/A"}
                    </p>
                  </div>
                </div>
                {application.invoice_number && (
                  <p className="text-xs text-green-700 bg-green-50 p-2 rounded">
                    Facture: <strong>{application.invoice_number}</strong>
                  </p>
                )}
              </div>
            </>
          )}

          {(application.status === "nouveau" || application.status === "en_attente") && (
            <>
              <textarea
                value={adminReview.admin_notes}
                onChange={(e) =>
                  onAdminReviewChange({
                    ...adminReview,
                    admin_notes: e.target.value,
                  })
                }
                rows={3}
                placeholder="Notes pour le client (optionnel)"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex gap-3">
                <button
                  onClick={onApprove}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approuver le Dossier
                </button>
                <button
                  onClick={onReject}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Rejeter
                </button>
              </div>
            </>
          )}

          {application.status !== "refuse" && application.payment_status === "paid" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-3">
                Paiement reçu - Confirmer pour générer la facture
              </p>
              <button
                onClick={onConfirmPayment}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                ✓ Confirmer le Paiement
              </button>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
