import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Mail, Phone, User, Lock, LogOut, FileText, Clock, CheckCircle, XCircle, Eye, EyeOff, Download, CreditCard } from "lucide-react";
import API_ENDPOINTS from "@/config/api";

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year?: number;
  price?: number;
}

interface Application {
  id: number;
  vehicle_id: number;
  vehicle?: Vehicle;
  service_type: string;
  status: "nouveau" | "en_attente" | "accepte" | "refuse" | "complete";
  payment_status: "pending" | "paid" | "confirmed";
  deposit_amount: number;
  total_amount: number;
  payment_method?: string;
  invoice_number?: string;
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
  paid_at?: string;
  // Leasing & Option d'achat (LOA)
  option_achat_active?: boolean;
  valeur_residuelle?: number;
  option_achat_levee?: boolean;
  date_levee_option?: string;
}

interface UserProfile {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  phone?: string;
}

export default function ClientProfile() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [activeTab, setActiveTab] = useState<"profile" | "applications" | "password">("profile");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profile edit state
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    firstname: "",
    lastname: "",
    phone: "",
  });

  // Modification du mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Simulation de payement
  const [paymentProcessing, setPaymentProcessing] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/signup");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setEditData({
        firstname: parsedUser.firstname,
        lastname: parsedUser.lastname,
        phone: parsedUser.phone || "",
      });

      fetchApplications(token);
    } catch (err) {
      console.error("Erreur de chargement du profil", err);
      navigate("/signup");
    }
  }, [navigate]);

  const fetchApplications = async (token: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.MY_APPLICATIONS, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error("Erreur de chargement des applications", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const response = await fetch(API_ENDPOINTS.PROFILE, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de la mise à jour du profil");
        return;
      }

      const updatedUser = { ...user, ...editData };
      setUser(updatedUser as UserProfile);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setEditMode(false);
      setSuccess("Profil mis à jour avec succès");
    } catch (err) {
      setError("Erreur de connexion au serveur");
      console.error(err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Le nouveau mot de passe doit contenir au moins 6 caractères");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const response = await fetch(API_ENDPOINTS.CHANGE_PASSWORD, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors du changement de mot de passe");
        return;
      }

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccess("Mot de passe changé avec succès");
    } catch (err) {
      setError("Erreur de connexion au serveur");
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleDownloadInvoice = async (applicationId: number, invoiceNumber: string) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const response = await fetch(API_ENDPOINTS.DOWNLOAD_INVOICE(applicationId), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      // Créer un blob et télécharger
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `facture_${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur téléchargement facture:", err);
      setError("Erreur lors du téléchargement de la facture");
    }
  };

  const handlePayBalance = async (applicationId: number) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      setPaymentProcessing(applicationId);
      setError("");

      // Simuler le paiement du solde
      const response = await fetch(API_ENDPOINTS.CLIENT_PAY_BALANCE(applicationId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({}),
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

      // Mettre à jour l'application dans la liste
      const updatedApp = responseData.application || responseData;
      setApplications(applications.map(app =>
        app.id === applicationId ? updatedApp : app
      ));

      setSuccess("✓ Paiement du solde effectué ! En attente de confirmation de l'admin.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du paiement");
    } finally {
      setPaymentProcessing(null);
    }
  };

  const handleLeverOptionAchat = async (applicationId: number) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      setPaymentProcessing(applicationId);
      setError("");

      const response = await fetch(API_ENDPOINTS.LEVER_OPTION_ACHAT(applicationId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({}),
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

      // Mettre à jour l'application dans la liste
      const updatedApp = responseData.application || responseData;
      setApplications(applications.map(app =>
        app.id === applicationId ? updatedApp : app
      ));

      setSuccess("✓ Option d'achat levée avec succès ! Le véhicule est maintenant vôtre.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la levée d'option");
    } finally {
      setPaymentProcessing(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepte":
      case "complete":
        return <CheckCircle size={20} className="text-green-600" />;
      case "refuse":
        return <XCircle size={20} className="text-red-600" />;
      default:
        return <Clock size={20} className="text-yellow-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "accepte":
        return "Approuvé";
      case "complete":
        return "Complété";
      case "refuse":
        return "Rejeté";
      case "en_attente":
        return "En attente";
      case "nouveau":
      default:
        return "Nouveau";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getServiceTypeLabel = (serviceType: string) => {
    switch (serviceType) {
      case "achat":
        return "🛒 Achat";
      case "location_court_terme":
        return "📅 Location Court Terme";
      case "location_longue_duree":
        return "📆 Location Longue Durée";
      default:
        return serviceType;
    }
  };

  const getPricingDescription = (app: Application) => {
    switch (app.service_type) {
      case "achat":
        return `Prix d'achat: ${app.total_amount.toLocaleString("fr-FR")} €`;
      case "location_court_terme":
        return `Location courte durée - Montant total: ${app.total_amount.toLocaleString("fr-FR")} €`;
      case "location_longue_duree":
        return `Location longue durée - Montant total: ${app.total_amount.toLocaleString("fr-FR")} €`;
      default:
        return `Montant total: ${app.total_amount.toLocaleString("fr-FR")} €`;
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-slate-50">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-50">
      <Navigation />

      <div className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  Bienvenue, {user?.firstname}!
                </h1>
                <p className="text-slate-600">Gérez votre profil et suivez vos dossiers</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={20} />
                Se déconnecter
              </button>
            </div>
          </div>

          {/* Navigation tableau Dashboard */}
          <div className="flex gap-4 mb-6 border-b border-slate-200 bg-white rounded-t-2xl px-8 py-0">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-4 font-semibold transition-colors border-b-2 ${activeTab === "profile"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
            >
              <User size={18} className="inline mr-2" />
              Mon Profil
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`py-4 px-4 font-semibold transition-colors border-b-2 ${activeTab === "applications"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
            >
              <FileText size={18} className="inline mr-2" />
              Mes Dossiers ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`py-4 px-4 font-semibold transition-colors border-b-2 ${activeTab === "password"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
            >
              <Lock size={18} className="inline mr-2" />
              Sécurité
            </button>
          </div>

          {/* Content */}
          <div className="bg-white rounded-b-2xl shadow-lg p-8">
            {/* Messages d'erreur et succès */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {success}
              </div>
            )}

            {/* Profile Dashboard */}
            {activeTab === "profile" && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Mes Informations</h2>

                {!editMode ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                      <Mail size={20} className="text-slate-600" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-600">Email</p>
                        <p className="font-semibold text-slate-900">{user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                      <User size={20} className="text-slate-600" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-600">Nom Complet</p>
                        <p className="font-semibold text-slate-900">
                          {user?.firstname} {user?.lastname}
                        </p>
                      </div>
                    </div>

                    {user?.phone && (
                      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                        <Phone size={20} className="text-slate-600" />
                        <div className="flex-1">
                          <p className="text-sm text-slate-600">Téléphone</p>
                          <p className="font-semibold text-slate-900">{user.phone}</p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setEditMode(true)}
                      className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Modifier le profil
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleEditProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        value={editData.firstname}
                        onChange={(e) =>
                          setEditData({ ...editData, firstname: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        value={editData.lastname}
                        onChange={(e) =>
                          setEditData({ ...editData, lastname: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) =>
                          setEditData({ ...editData, phone: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditMode(false)}
                        className="px-6 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Applications Dashboard */}
            {activeTab === "applications" && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Suivi de mes Dossiers</h2>

                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-600 mb-4">Vous n'avez pas encore soumis de dossier</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {/* Dossier Header */}
                        <div className={`border-b border-slate-200 p-6 ${
                          app.status === "refuse"
                            ? "bg-gradient-to-r from-red-50 to-red-100"
                            : app.status === "accepte" || app.status === "complete"
                              ? "bg-gradient-to-r from-green-50 to-green-100"
                              : "bg-gradient-to-r from-blue-50 to-blue-100"
                        }`}>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900">
                                {app.vehicle?.brand} {app.vehicle?.model} ({app.vehicle?.year})
                              </h3>
                              <p className="text-slate-600 text-sm mt-1">
                                Dossier #{app.id} • Créé le {formatDate(app.created_at)}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2 justify-end">
                                {getStatusIcon(app.status)}
                                <span className={`font-semibold text-lg ${app.status === "accepte" || app.status === "complete"
                                    ? "text-green-600"
                                    : app.status === "refuse"
                                      ? "text-red-600"
                                      : "text-yellow-600"
                                  }`}>
                                  {getStatusLabel(app.status)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Prix & Paiement */}
                        <div className="p-6 bg-white space-y-4">
                          {/* DOSSIER REJETÉ - Message de bloc */}
                          {app.status === "refuse" && (
                            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 text-red-900">
                              <div className="flex items-start gap-3">
                                <XCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-bold text-lg mb-1">Dossier Rejeté</p>
                                  <p className="text-sm mb-2">
                                    Malheureusement, votre dossier a été rejeté. Le paiement est annulé et aucune action supplémentaire n'est requise.
                                  </p>
                                  {app.admin_notes && (
                                    <p className="text-sm italic text-red-800 mt-2">
                                      <strong>Raison :</strong> {app.admin_notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Afficher les informations tarifaires uniquement si dossier non rejeté */}
                          {app.status !== "refuse" && (
                            <>
                              {/* Service Type Info */}
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm font-medium text-blue-900 mb-2">Type de Service</p>
                                <p className="text-lg font-bold text-blue-700">{getServiceTypeLabel(app.service_type)}</p>
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                <div className="bg-slate-50 p-4 rounded-lg">
                                  <p className="text-xs text-slate-500 font-medium">Acompte</p>
                                  <p className="text-xl font-bold text-slate-900 mt-1">
                                    {app.deposit_amount.toLocaleString("fr-FR")} €
                                  </p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg">
                                  <p className="text-xs text-slate-500 font-medium">Prix Total</p>
                                  <p className="text-xl font-bold text-slate-900 mt-1">
                                    {app.total_amount.toLocaleString("fr-FR")} €
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">{getPricingDescription(app)}</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                  <p className="text-xs text-blue-600 font-medium">Solde à Payer</p>
                                  <p className="text-xl font-bold text-blue-700 mt-1">
                                    {(app.total_amount - app.deposit_amount).toLocaleString("fr-FR")} €
                                  </p>
                                </div>
                              </div>

                              {/* Edition de la facture de réservation */}
                              {app.invoice_number && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex justify-between items-center">
                                  <div>
                                    <p className="text-sm font-medium text-green-900">Facture disponible</p>
                                    <p className="text-xs text-green-700 mt-1">Facture #{app.invoice_number}</p>
                                  </div>
                                  <button
                                    onClick={() => handleDownloadInvoice(app.id, app.invoice_number!)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                  >
                                    <Download size={16} />
                                    Télécharger
                                  </button>
                                </div>
                              )}

                              {/* Méthode de paiement */}
                              {app.payment_method && (
                                <div className="bg-slate-50 rounded-lg p-4">
                                  <p className="text-sm font-medium text-slate-700 mb-2">Méthode de paiement</p>
                                  <div className="flex items-center gap-2">
                                    <CreditCard size={18} className="text-slate-600" />
                                    <span className="text-slate-900 font-medium">
                                      {app.payment_method === "credit" ? "Carte Bancaire" : "Virement Bancaire"}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Informations sur le statut du paiement */}
                              {app.payment_status === "confirmed" && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
                                  <p className="font-semibold mb-1">✓ Paiement Confirmé</p>
                                  <p>Votre dossier est complètement financé. Vous pouvez procéder à la livraison du véhicule.</p>
                                  {app.paid_at && (
                                    <p className="text-xs text-green-700 mt-2">Payé le {formatDate(app.paid_at)}</p>
                                  )}
                                </div>
                              )}

                              {app.payment_status === "paid" && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm">
                                  <p className="font-semibold mb-1">💳 Paiement Reçu</p>
                                  <p>En attente de confirmation par l'administrateur.</p>
                                </div>
                              )}

                              {app.payment_status === "pending" && app.status === "accepte" && (
                                <div className="space-y-3">
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm">
                                    <p className="font-semibold mb-1">🎉 Dossier Accepté</p>
                                    <p>Votre dossier a été accepté par l'administrateur. Veuillez finaliser le paiement du solde restant pour procéder.</p>
                                  </div>

                                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-300 rounded-lg p-4">
                                    <p className="text-sm font-semibold text-orange-900 mb-3">💰 Paiement du Solde</p>
                                    <div className="bg-white rounded-lg p-3 mb-3 border border-orange-200">
                                      <p className="text-xs text-gray-600 mb-1">Montant à payer:</p>
                                      <p className="text-2xl font-bold text-orange-600">
                                        {(app.total_amount - app.deposit_amount).toLocaleString("fr-FR")} €
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => handlePayBalance(app.id)}
                                      disabled={paymentProcessing === app.id}
                                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                                        paymentProcessing === app.id
                                          ? "bg-gray-400 text-white cursor-not-allowed"
                                          : "bg-orange-600 hover:bg-orange-700 text-white"
                                      }`}
                                    >
                                      {paymentProcessing === app.id
                                        ? "Paiement en cours..."
                                        : "💳 Simuler le Paiement du Solde"}
                                    </button>
                                  </div>
                                </div>
                              )}

                              {app.payment_status === "pending" && app.status !== "accepte" && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
                                  <p className="font-semibold mb-1">⏳ En Attente d'Approbation</p>
                                  <p>Votre dossier est en cours de vérification par l'administrateur.</p>
                                </div>
                              )}

                              {/* Option d'Achat - Location Longue Durée */}
                              {app.service_type === "location_longue_duree" && app.option_achat_active && !app.option_achat_levee && (
                                <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
                                  <div className="flex items-start justify-between mb-4">
                                    <div>
                                      <p className="text-lg font-bold text-purple-900">💰 Option d'Achat Disponible</p>
                                      <p className="text-sm text-purple-700 mt-1">
                                        Transformez votre leasing en achat à la fin du contrat
                                      </p>
                                    </div>
                                  </div>

                                  {app.valeur_residuelle && app.valeur_residuelle > 0 && (
                                    <div className="bg-white p-4 rounded-lg mb-4 border border-purple-200">
                                      <p className="text-sm text-purple-600 font-medium mb-2">Valeur résiduelle de rachat</p>
                                      <p className="text-2xl font-bold text-purple-700">
                                        {app.valeur_residuelle.toLocaleString("fr-FR")} €
                                      </p>
                                      <p className="text-xs text-purple-600 mt-2">
                                        À payer en fin de contrat de leasing pour acquérir le véhicule
                                      </p>
                                    </div>
                                  )}

                                  {app.status === "complete" && app.payment_status === "confirmed" && (
                                    <button
                                      onClick={() => handleLeverOptionAchat(app.id)}
                                      disabled={paymentProcessing === app.id}
                                      className={`w-full px-6 py-3 rounded-lg font-medium text-white transition ${
                                        paymentProcessing === app.id
                                          ? "bg-gray-400 cursor-not-allowed"
                                          : "bg-purple-600 hover:bg-purple-700"
                                      }`}
                                    >
                                      {paymentProcessing === app.id ? "Traitement..." : "🔑 Lever l'Option d'Achat"}
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* Option Levée */}
                              {app.option_achat_levee && (
                                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                                  <p className="text-lg font-bold text-green-900 mb-2">✓ Option d'Achat Levée</p>
                                  <p className="text-sm text-green-700">
                                    Félicitations ! Le véhicule vous appartient maintenant. Une facture de rachat a été générée.
                                  </p>
                                  {app.date_levee_option && (
                                    <p className="text-xs text-green-600 mt-2">
                                      Levée le {formatDate(app.date_levee_option)}
                                    </p>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Password Dashboard */}
            {activeTab === "password" && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Changer le Mot de Passe</h2>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            current: !showPasswords.current,
                          })
                        }
                        className="absolute right-3 top-2.5 text-slate-600 hover:text-slate-900"
                      >
                        {showPasswords.current ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            new: !showPasswords.new,
                          })
                        }
                        className="absolute right-3 top-2.5 text-slate-600 hover:text-slate-900"
                      >
                        {showPasswords.new ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Confirmer le nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            confirm: !showPasswords.confirm,
                          })
                        }
                        className="absolute right-3 top-2.5 text-slate-600 hover:text-slate-900"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors mt-6"
                  >
                    Changer le mot de passe
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
