import { Link } from "react-router-dom";
import { Car, Shield, Wrench, FileCheck, Zap, Users, Fuel, DollarSign, MapPin } from "lucide-react";
import Navigation from "@/components/Navigation";
import VehicleCard from "@/components/VehicleCard";

export default function Index() {
  return (
    <div className="w-full">
      <Navigation />

      {/* Section principale */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20" />
        </div>

        <div className="relative container mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-slide-up">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-4">
                Bloc03_Baers - Votre Plateforme de Location et Vente
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                Achetez ou louez parmi notre sélection de véhicules de qualité avec assurance, assistance et entretien inclus. Des solutions financières adaptées à vos besoins.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/browse"
                className="btn-primary text-center"
              >
                Parcourir les véhicules
              </Link>
              <button className="btn-outline text-center">
                Essai routier gratuit
              </button>
            </div>

            <div className="flex gap-8 pt-8">
              <div>
                <p className="text-3xl font-bold text-primary">500+</p>
                <p className="text-slate-600">Véhicules disponibles</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">15+</p>
                <p className="text-slate-600">Grandes marques</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">100%</p>
                <p className="text-slate-600">Contrôle technique</p>
              </div>
            </div>
          </div>

          <div className="relative h-96 lg:h-full hidden lg:flex items-center justify-center">
            <div className="relative w-full h-full max-w-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl opacity-20 blur-3xl" />
              <div className="relative bg-gradient-to-br from-blue-600 to-blue-900 rounded-2xl p-8 text-white h-full flex flex-col items-center justify-center">
                <Car size={120} className="opacity-80" />
                <p className="mt-4 text-lg font-semibold text-center opacity-90">
                  Sélection Premium de Véhicules
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="mb-4">Nos Services Complets</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Bien plus que des véhicules, une expérience complète et sécurisée
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield size={32} className="text-primary" />,
                title: "Assurance Tous Risques",
                description: "Protection complète incluse dans votre contrat de location",
              },
              {
                icon: <Wrench size={32} className="text-primary" />,
                title: "Entretien & Assistance",
                description: "Maintenance régulière et dépannage 24h/24 inclus",
              },
              {
                icon: <FileCheck size={32} className="text-primary" />,
                title: "Contrôle Technique",
                description: "Tous nos véhicules passent des inspections rigoureuses",
              },
              {
                icon: <DollarSign size={32} className="text-primary" />,
                title: "Solutions Financement",
                description: "Plans de paiement flexibles adaptés à votre budget",
              },
              {
                icon: <Car size={32} className="text-primary" />,
                title: "Essai Routier",
                description: "Testez le véhicule avant de vous décider",
              },
              {
                icon: <MapPin size={32} className="text-primary" />,
                title: "Reprise d'Ancien Véhicule",
                description: "Facilitez votre transition avec notre service de reprise",
              },
            ].map((service, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">
                  {service.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Offer Section - Cartes Services */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="mb-4">Nos Trois Services</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Choisissez le service qui correspond à vos besoins
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Achat Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border-2 border-blue-200 hover:shadow-xl transition-shadow">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Car size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Achat</h3>
                <p className="text-slate-600">Trouvez votre véhicule d'occasion idéal</p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  "Large sélection de véhicules",
                  "Contrôles techniques complets",
                  "Financement disponible",
                  "Reprise de votre ancien véhicule",
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-slate-700">
                    <span className="text-blue-600 font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                to="/browse?service_type=achat"
                className="btn-primary w-full block text-center"
              >
                Voir les véhicules à vendre
              </Link>
            </div>

            {/* Location Court Terme Card */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border-2 border-green-200 hover:shadow-xl transition-shadow">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
                  <Zap size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Location Court Terme</h3>
                <p className="text-slate-600">Pour vos besoins occasionnels</p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  "À partir de quelques jours",
                  "Assurance tous risques incluse",
                  "Assistance 24h/24",
                  "Flexible et sans engagement",
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-slate-700">
                    <span className="text-green-600 font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                to="/browse?service_type=location_court_terme"
                className="btn-primary w-full block text-center"
              >
                Louer pour quelques jours
              </Link>
            </div>

            {/* Location Longue Durée Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border-2 border-purple-200 hover:shadow-xl transition-shadow">
              <div className="mb-6">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Fuel size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Location Longue Durée</h3>
                <p className="text-slate-600">Avec option d'achat</p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  "À partir de 3 mois",
                  "Assurance & entretien inclus",
                  "Option d'achat à tout moment",
                  "Assistance dépannage 24/7",
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-slate-700">
                    <span className="text-purple-600 font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                to="/browse?service_type=location_longue_duree"
                className="btn-primary w-full block text-center"
              >
                Louer long terme
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-white">Prêt à commencer ?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Créez votre compte pour explorer notre gamme complète et déposer votre dossier
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-white text-primary hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              S'inscrire maintenant
            </Link>
            <Link
              to="/browse"
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Parcourir d'abord
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">À propos</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    Notre histoire
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    Nos valeurs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/services" className="hover:text-white transition-colors">
                    Nos services
                  </Link>
                </li>
                <li>
                  <Link to="/browse" className="hover:text-white transition-colors">
                    Parcourir
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Aide</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    À propos
                  </Link>
                </li>
                <li>
                  <a href="mailto:contact@m-motors.fr" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Conditions d'utilisation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Politique de confidentialité
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8">
            <p className="text-center text-sm">
              © 2026 M-Motors. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}