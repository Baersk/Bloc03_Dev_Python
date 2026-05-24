import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { ArrowLeft, AlertCircle, CheckCircle, CreditCard } from "lucide-react";
import { Vehicle, Application } from "../../types";
import API_ENDPOINTS from "@/config/api";

export default function ApplicationForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get("vehicle_id");
  const serviceType = searchParams.get("service_type");

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Contrôle du workflow de réservation (Formulaire - Paiement - Confirmation)"
  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Variable pour l'âge
  const [formData, setFormData] = useState({
    driving_license_number: "",
    driving_license_expiry: "",
    payment_method: "credit",
    package_included: false,
    option_achat_active: false,
    start_date: "",
    end_date: "",
  });

  // Calculs de prix et acomptes
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [depositAmount, setDepositAmount] = useState(500);
  const [valeurResiduelle, setValeurResiduelle] = useState(0);

  useEffect(() => {
    // Vérifier l'authentification d'abord
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/signup");
      return;
    }

    if (!vehicleId) {
      setError("Véhicule non spécifié");
      setLoading(false);
      return;
    }
    fetchVehicle();
  }, [vehicleId, navigate]);

  async function fetchVehicle() {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.VEHICLE_BY_ID(parseInt(vehicleId || "0")));
      if (!response.ok) throw new Error(`Erreur ${response.status}: Véhicule non trouvé`);

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Réponse serveur invalide");
      }
      setVehicle(data);
      calculatePrice(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  function calculatePrice(veh: Vehicle, packageIncluded: boolean = formData.package_included, startDate: string = formData.start_date, endDate: string = formData.end_date) {
    let total = 0;

    if (serviceType === "achat") {
      total = veh.price || 0;
    } else if (serviceType === "location_court_terme" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      total = (veh.rental_price_daily || 0) * Math.max(days, 1);
    } else if (serviceType === "location_longue_duree" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const months = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
      total = (veh.rental_price_monthly || 0) * Math.max(months, 1);
    }

    // Ajouter 20% si pack inclus
    if (packageIncluded) {
      total = total * 1.2;
    }

    setCalculatedTotal(Math.max(total, 0));
    setDepositAmount(Math.min(500, Math.max(total * 0.1, 100)));
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newFormData = { ...formData };
    if (e.target.name === "start_date") {
      newFormData.start_date = e.target.value;
    } else if (e.target.name === "end_date") {
      newFormData.end_date = e.target.value;
    }
    setFormData(newFormData);
    if (vehicle) {
      calculatePrice(vehicle, newFormData.package_included, newFormData.start_date, newFormData.end_date);
    }
  }

  async function handleSubmitApplicationForm(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    if (!formData.driving_license_number || !formData.driving_license_expiry) {
      setError("Le numéro et la date d'expiration du permis sont requis");
      return;
    }

    if ((serviceType === "location_court_terme" || serviceType === "location_longue_duree") && 
        (!formData.start_date || !formData.end_date)) {
      setError("Les dates de location sont requises");
      return;
    }

    setError("");
    setFormSubmitted(true);
    setStep("payment");
  }

  async function simulateDepositPaymentAndSubmit() {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/signup");
      return;
    }

    try {
      setPaymentProcessing(true);
      setError("");

      // Simuler le traitement du paiement
      await new Promise(resolve => setTimeout(resolve, 2000));

      const payload: any = {
        vehicle_id: parseInt(vehicleId || "0"),
        service_type: serviceType || vehicle?.service_type,
        driving_license_number: formData.driving_license_number,
        driving_license_expiry: formData.driving_license_expiry,
        package_included: formData.package_included,
        payment_method: formData.payment_method,
        total_amount: calculatedTotal,
        deposit_amount: depositAmount,
        notes: `Pack inclus: ${formData.package_included ? "Oui - Assurance tous risques, Assistance dépannage, Entretien et SAV, Contrôle technique" : "Non"}`,
        // Leasing & Option d'achat
        option_achat_active: formData.option_achat_active,
        valeur_residuelle: valeurResiduelle,
      };

      // Ajouter les dates si location
      if (formData.start_date) payload.start_date = formData.start_date;
      if (formData.end_date) payload.end_date = formData.end_date;

      const response = await fetch(API_ENDPOINTS.APPLICATIONS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erreur ${response.status}`);
        } catch (e) {
          throw new Error(`Erreur serveur: ${response.status}`);
        }
      }

      setStep("success");
      setSuccess(true);
      setError("");
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setStep("payment");
    } finally {
      setPaymentProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="text-center py-12">
          <p className="text-gray-600">Chargement du véhicule...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="text-center py-12">
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/browse")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Retour au catalogue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        {/* Vehicle Summary */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {vehicle.brand} {vehicle.model} ({vehicle.year})
          </h2>
          <p className="text-gray-700">
            <strong>Type :</strong> {serviceType === "achat" ? "Achat" : serviceType === "location_court_terme" ? "Location court terme" : "Location longue durée"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-lg text-center mb-6">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-lg font-bold mb-2">✓ Dossier soumis avec succès !</p>
            <p className="text-sm">Vous allez être redirigé vers votre tableau de bord...</p>
          </div>
        )}

        {/* Étape 1 : Formulaire de soumission du dossier de demande (Achat/Location)*/}
        {step === "form" && !formSubmitted && (
          <form onSubmit={handleSubmitApplicationForm} className="bg-white rounded-lg shadow-lg p-8 space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Étape 1 : Formulaire de dossier</h3>
              <p className="text-gray-600">Complétez les informations pour constituer votre dossier</p>
            </div>

            {/* Dates pour la location */}
            {(serviceType === "location_court_terme" || serviceType === "location_longue_duree") && (
              <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-900">Période de location</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de début *</label>
                    <input
                      type="date"
                      name="start_date"
                      required
                      value={formData.start_date}
                      onChange={handleDateChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin *</label>
                    <input
                      type="date"
                      name="end_date"
                      required
                      value={formData.end_date}
                      onChange={handleDateChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* License */}
            <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-gray-900">Permis de conduire</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de permis *
                </label>
                <input
                  type="text"
                  required
                  value={formData.driving_license_number}
                  onChange={(e) => setFormData({ ...formData, driving_license_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 1234567890123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'expiration *
                </label>
                <input
                  type="date"
                  required
                  value={formData.driving_license_expiry}
                  onChange={(e) => setFormData({ ...formData, driving_license_expiry: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Package Option */}
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.package_included}
                  onChange={(e) => {
                    const newValue = e.target.checked;
                    setFormData({ ...formData, package_included: newValue });
                    if (vehicle) {
                      calculatePrice(vehicle, newValue, formData.start_date, formData.end_date);
                    }
                  }}
                  className="w-4 h-4 mt-1 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <p className="font-semibold text-gray-900">Pack Premium (+20%)</p>
                  <p className="text-sm text-gray-700 mt-1">Inclus dans ce pack :</p>
                  <ul className="text-sm text-gray-700 mt-2 space-y-1 ml-4">
                    <li>● Assurance tous risques</li>
                    <li>● Assistance dépannage 24h/24</li>
                    <li>● Entretien et SAV complets</li>
                    <li>● Contrôle technique inclus</li>
                  </ul>
                </div>
              </label>
            </div>

            {/* Option d'Achat - LLD Only */}
            {serviceType === "location_longue_duree" && (
              <div className="bg-purple-50 border border-purple-300 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.option_achat_active}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      setFormData({ ...formData, option_achat_active: newValue });
                      if (vehicle && newValue) {
                        // Calculer valeur résiduelle (environ 40% du prix)
                        setValeurResiduelle(vehicle.price * 0.4);
                      } else {
                        setValeurResiduelle(0);
                      }
                    }}
                    className="w-4 h-4 mt-1 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Option d'achat en fin de contrat</p>
                    <p className="text-sm text-gray-700 mt-1">
                      Transformez votre leasing en achat à la fin du contrat
                    </p>
                    {formData.option_achat_active && valeurResiduelle > 0 && (
                      <p className="text-sm text-purple-700 font-bold mt-2">
                        💰 Valeur résiduelle de rachat : {valeurResiduelle.toLocaleString("fr-FR")} €
                      </p>
                    )}
                  </div>
                </label>
              </div>
            )}

            {/* Méthode de Paiement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Méthode de paiement *
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment_method"
                    value="credit"
                    checked={formData.payment_method === "credit"}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium text-gray-900">💳 Carte Bancaire</p>
                    <p className="text-sm text-gray-600">Visa, Mastercard, Amex</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment_method"
                    value="transfer"
                    checked={formData.payment_method === "transfer"}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium text-gray-900">🏦 Virement Bancaire</p>
                    <p className="text-sm text-gray-600">Virement SEPA instantané</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Affichage du récapitulatif financier */}
            {calculatedTotal > 0 && (
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border border-gray-200 space-y-3">
                <h4 className="font-semibold text-gray-900">Récapitulatif financier</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prix total:</span>
                    <span className="font-semibold text-gray-900">{calculatedTotal.toLocaleString("fr-FR")} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Acompte à payer:</span>
                    <span className="font-semibold text-blue-600">{depositAmount.toLocaleString("fr-FR")} €</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="text-gray-900 font-bold">Solde après approbation:</span>
                    <span className="text-lg font-bold text-blue-700">{(calculatedTotal - depositAmount).toLocaleString("fr-FR")} €</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              Continuer vers le paiement
            </button>

            <p className="text-xs text-gray-500 text-center">
              En continuant, vous acceptez nos conditions générales et la politique de confidentialité.
            </p>
          </form>
        )}

        {/* Étape 2 : Règlement de l'acompte / Dépôt de garantie pour la réservation */}
        {step === "payment" && formSubmitted && (
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Étape 2 : Paiement de l'acompte</h3>
              <p className="text-gray-600">Simulez le paiement de votre acompte pour finaliser la soumission du dossier</p>
            </div>

            {/* Dossier Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
              <h4 className="font-semibold text-gray-900">Récapitulatif de votre dossier</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Véhicule:</span>
                  <span className="font-medium text-gray-900">{vehicle.brand} {vehicle.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Permis:</span>
                  <span className="font-medium text-gray-900">{formData.driving_license_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Permis valide jusqu'au:</span>
                  <span className="font-medium text-gray-900">{formData.driving_license_expiry}</span>
                </div>
                {formData.start_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Période:</span>
                    <span className="font-medium text-gray-900">{formData.start_date} au {formData.end_date}</span>
                  </div>
                )}
                {formData.package_included && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pack Premium:</span>
                    <span className="font-medium text-amber-600">✓ Inclus</span>
                  </div>
                )}
              </div>
            </div>

            {/* Détails du paiement */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border border-gray-200 space-y-3">
              <h4 className="font-semibold text-gray-900">Détails du paiement</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Prix total:</span>
                  <span className="font-semibold text-gray-900">{calculatedTotal.toLocaleString("fr-FR")} €</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-gray-900 font-bold">Acompte à payer maintenant:</span>
                  <span className="text-xl font-bold text-red-600">{depositAmount.toLocaleString("fr-FR")} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Solde après approbation:</span>
                  <span className="text-sm text-blue-600">{(calculatedTotal - depositAmount).toLocaleString("fr-FR")} €</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>ℹ️ Simulation :</strong> Cliquez sur le bouton ci-dessous pour simuler le paiement de l'acompte. Cela soumettra directement votre dossier à l'administration pour validation.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setFormSubmitted(false);
                  setStep("form");
                }}
                disabled={paymentProcessing}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                onClick={simulateDepositPaymentAndSubmit}
                disabled={paymentProcessing}
                className={`flex-1 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition ${
                  paymentProcessing
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                <CreditCard className="w-5 h-5" />
                {paymentProcessing ? "Traitement en cours..." : `Payer l'acompte (${depositAmount.toLocaleString("fr-FR")} €)`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
