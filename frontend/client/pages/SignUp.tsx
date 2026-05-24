import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
import API_ENDPOINTS from "@/config/api";

type AuthMode = "signup" | "login";

export default function SignUp() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("signup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstname: "",
    lastname: "",
    phone: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Email et mot de passe requis");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Email invalide");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }

    if (mode === "signup") {
      if (!formData.firstname || !formData.lastname) {
        setError("Prénom et nom requis");
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Les mots de passe ne correspondent pas");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const endpoint = mode === "signup" ? API_ENDPOINTS.REGISTER : API_ENDPOINTS.LOGIN;
      const payload = mode === "signup"
        ? {
          email: formData.email,
          password: formData.password,
          firstname: formData.firstname,
          lastname: formData.lastname,
          phone: formData.phone || undefined,
        }
        : {
          email: formData.email,
          password: formData.password,
        };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Une erreur s'est produite");
        return;
      }

      // Stocker le token
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Rediriger vers le bon dashboard
      if (data.user?.is_admin) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-50">
      <Navigation />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {mode === "signup" ? "Créer un compte" : "Se connecter"}
              </h1>
              <p className="text-slate-600">
                {mode === "signup"
                  ? "Rejoignez Bloc03_Baers et trouvez votre véhicule idéal"
                  : "Accédez à votre compte Bloc03_Baers"}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-slate-200">
              <button
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
                className={`pb-3 px-4 font-semibold transition-colors ${mode === "signup"
                    ? "border-b-2 border-primary text-primary"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                S'inscrire
              </button>
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className={`pb-3 px-4 font-semibold transition-colors ${mode === "login"
                    ? "border-b-2 border-primary text-primary"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Se connecter
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Formulaire de saisie */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Signup: Firstname & Lastname */}
              {mode === "signup" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <User size={16} className="inline mr-2" />
                      Prénom
                    </label>
                    <input
                      type="text"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleChange}
                      placeholder="Jean"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      placeholder="Dupont"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Signup: Phone */}
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Phone size={16} className="inline mr-2" />
                    Téléphone (optionnel)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+33 6 12 34 56 78"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Lock size={16} className="inline mr-2" />
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Signup: Confirmation Password */}
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Chargement..."
                  : mode === "signup"
                    ? "Créer un compte"
                    : "Se connecter"}
              </button>
            </form>

            {/* Login:Password oublié Link */}
            {mode === "login" && (
              <div className="mt-4 text-center">
                <a href="#" className="text-sm text-primary hover:underline">
                  Mot de passe oublié?
                </a>
              </div>
            )}

            {/* Terms */}
            {mode === "signup" && (
              <p className="mt-6 text-xs text-slate-600 text-center">
                En créant un compte, vous acceptez nos{" "}
                <a href="#" className="text-primary hover:underline">
                  conditions d'utilisation
                </a>{" "}
                et notre{" "}
                <a href="#" className="text-primary hover:underline">
                  politique de confidentialité
                </a>
              </p>
            )}
          </div>

          {/* Revenir à l'accueil */}
          <div className="text-center mt-6">
            <p className="text-slate-600">
              <Link to="/" className="text-primary hover:underline font-semibold">
                ← Retour à l'accueil
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}