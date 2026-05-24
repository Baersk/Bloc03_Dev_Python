import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { ShoppingCart, Calendar, CreditCard, ArrowRight } from "lucide-react";

export default function Services() {
  const navigate = useNavigate();

  const services = [
    {
      id: "achat",
      title: "Achat",
      icon: ShoppingCart,
      color: "bg-blue-100 text-blue-600",
      description: "Trouvez votre véhicule idéal",
      features: [
        "Large sélection de véhicules",
        "Contrôles techniques complets",
        "Option: Assurance & entretien inclus",
      ],
      cta: "Voir les véhicules à vendre",
    },
    {
      id: "location_court_terme",
      title: "Location Court Terme",
      icon: Calendar,
      color: "bg-green-100 text-green-600",
      description: "Pour vos besoins occasionnels",
      features: [
        "À partir de quelques jours",
        "Option: Assurance tous risques incluse",
        "Assistance 24h/24",
      ],
      cta: "Louer pour quelques jours",
    },
    {
      id: "location_longue_duree",
      title: "Location Longue Durée",
      icon: Calendar,
      color: "bg-purple-100 text-purple-600",
      description: "Leasing longue durée",
      features: [
        "À partir de 1 mois",
        "Option: Assurance & entretien inclus",
        "Assistance dépannage 24/7",
      ],
      cta: "Louer long terme",
    },
  ];

  const handleServiceClick = (serviceType: string) => {
    navigate(`/browse?service_type=${serviceType}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navigation />

      {/* Section principale */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Nos Trois Services
          </h1>
          <p className="text-xl text-blue-100">
            Choisissez le service qui correspond à vos besoins
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <div
                key={service.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100"
              >
                {/* Icon Header */}
                <div className={`${service.color} p-8 flex items-center justify-center`}>
                  <IconComponent size={48} />
                </div>

                {/* Content */}
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {service.title}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-green-600 font-bold mt-1">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleServiceClick(service.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {service.cta}
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Comment ça fonctionne ?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Parcourir", desc: "Explorez notre catalogue de véhicules" },
              { step: "2", title: "S'inscrire", desc: "Créez votre compte gratuitement" },
              { step: "3", title: "Soumettre", desc: "Remplissez votre dossier en ligne" },
              { step: "4", title: "Finaliser", desc: "Confirmez et finalisez votre demande" },
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg text-center">
                <div className="inline-flex w-12 h-12 bg-blue-600 text-white rounded-full items-center justify-center font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          Questions Fréquentes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {[
            {
              q: "Quel est le meilleur service pour moi ?",
              a: "Cela dépend de vos besoins : l'achat si vous voulez un véhicule personnel, la location court terme pour des besoins ponctuels, et la location longue durée pour une utilisation régulière sans engagement à long terme.",
            },
            {
              q: "Y a-t-il des frais cachés ?",
              a: "Non, tous les frais sont clairement affichés dès le départ. Pour la location, l'assurance et l'assistance sont toujours incluses.",
            },
            {
              q: "Comment se déroule l'approbation ?",
              a: "Après soumission de votre dossier en ligne, notre équipe l'examine et vous répond dans les 24h. Le processus est 100% dématérialisé.",
            },
            {
              q: "Puis-je télécharger une facture ?",
              a: "Oui, vous recevez une facture PDF dès la confirmation de votre paiement, accessible directement depuis votre espace client.",
            },
          ].map((item, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3">{item.q}</h3>
              <p className="text-gray-600">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Trouvez le véhicule parfait pour vous aujourd'hui
          </p>
          <button
            onClick={() => navigate("/browse")}
            className="bg-white text-blue-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
          >
            Explorer le catalogue
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}