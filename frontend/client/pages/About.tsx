import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Award, Users, Truck, Heart, CheckCircle, ArrowRight } from "lucide-react";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            À Propos de M-Motors
          </h1>
          <p className="text-xl text-blue-100">
            Plus de 35 ans d'excellence dans la vente de véhicules
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20">
        {/* Company Story */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Notre Histoire</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p>
                <strong>M-Motors</strong> a été créée en <strong>1987</strong> comme un spécialiste 
                en vente de véhicules d'occasion. Dès ses débuts, notre entreprise s'est 
                distinguée par un engagement inébranlable envers la satisfaction client.
              </p>
              <p>
                Grâce à notre dévouement et nos pratiques commerciales exemplaires, M-Motors 
                a connu une croissance remarquable. Après <strong>35 ans de création</strong>, 
                nous sommes fiers d'être devenue l'une des <strong>10 entreprises leaders 
                au niveau national</strong> dans notre domaine.
              </p>
              <p>
                Ce succès extraordinaire ne s'est pas construit par hasard. Il est le fruit 
                de notre volonté constante de placer la satisfaction client au cœur de tout 
                ce que nous faisons.
              </p>
            </div>

            {/* Stats */}
            <div className="space-y-6">
              <div className="bg-blue-50 p-8 rounded-lg border-l-4 border-blue-600">
                <div className="text-4xl font-bold text-blue-600 mb-2">35+</div>
                <p className="text-gray-700">Années d'expérience</p>
              </div>
              <div className="bg-green-50 p-8 rounded-lg border-l-4 border-green-600">
                <div className="text-4xl font-bold text-green-600 mb-2">~1M</div>
                <p className="text-gray-700">Clients satisfaits au niveau national</p>
              </div>
              <div className="bg-purple-50 p-8 rounded-lg border-l-4 border-purple-600">
                <div className="text-4xl font-bold text-purple-600 mb-2">800+</div>
                <p className="text-gray-700">Employés talentueux</p>
              </div>
              <div className="bg-orange-50 p-8 rounded-lg border-l-4 border-orange-600">
                <div className="text-4xl font-bold text-orange-600 mb-2">Top 10</div>
                <p className="text-gray-700">Entreprises leaders nationales</p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-20 bg-gray-50 p-12 rounded-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Nos Valeurs Fondamentales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Satisfaction Client</h3>
              <p className="text-gray-600">
                Chaque décision que nous prenons tourne autour de votre satisfaction 
                et de votre bonheur.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg text-center">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Qualité & Fiabilité</h3>
              <p className="text-gray-600">
                Tous nos véhicules subissent des contrôles rigoureux pour garantir 
                leur sécurité et leur fiabilité.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Service Personnalisé</h3>
              <p className="text-gray-600">
                Nous vous écoutons et vous conseillons le véhicule le plus adapté 
                à votre situation.
              </p>
            </div>
          </div>
        </div>

        {/* What Makes Us Special */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Pourquoi Choisir M-Motors ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-6">
              <Award className="w-12 h-12 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Gamme Variée</h3>
                <p className="text-gray-600">
                  Nous proposons une large sélection de marques, modèles, motorisations 
                  et prix pour répondre à tous les budgets et besoins.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <Truck className="w-12 h-12 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Contrôles Approfondis</h3>
                <p className="text-gray-600">
                  Tous nos véhicules bénéficient de contrôles techniques approfondis, 
                  de remises en état et de garanties.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <Heart className="w-12 h-12 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Essai Routier</h3>
                <p className="text-gray-600">
                  Testez le véhicule avant l'achat pour vérifier son confort et son 
                  adéquation à vos besoins.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <CheckCircle className="w-12 h-12 text-purple-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Solutions de Financement</h3>
                <p className="text-gray-600">
                  Nous proposons des solutions de financement flexibles en partenariat 
                  avec des organismes financiers.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <Users className="w-12 h-12 text-orange-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Service Après-Vente</h3>
                <p className="text-gray-600">
                  Notre équipe expérimentée vous accompagne avec conseil personnalisé 
                  et support continu.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <Award className="w-12 h-12 text-indigo-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Reprise d'Ancien Véhicule</h3>
                <p className="text-gray-600">
                  Facilitez votre achat en nous confiant la reprise de votre ancien 
                  véhicule.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Team */}
        <div className="mb-20 bg-blue-50 p-12 rounded-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre Équipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">800+</div>
              <p className="text-gray-700">
                Employés passionnés et expérimentés prêts à vous servir
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">Expertise</div>
              <p className="text-gray-700">
                Chaque membre de notre équipe possède une expertise approfondie 
                du secteur automobile
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">Dévouement</div>
              <p className="text-gray-700">
                Notre équipe est entièrement dévouée à votre satisfaction 
                et votre succès
              </p>
            </div>
          </div>
        </div>

        {/* Commitment */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Notre Engagement</h2>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-12 rounded-lg">
            <p className="text-lg leading-relaxed mb-6">
              Chez M-Motors, nous nous engageons à rester le partenaire de confiance 
              de nos clients. Notre succès est mesuré par votre satisfaction, et chaque 
              interaction avec notre entreprise doit refléter notre passion pour l'excellence.
            </p>
            <p className="text-lg leading-relaxed">
              Nous continuerons à innover, à améliorer nos services et à vous offrir 
              l'expérience d'achat automobile la plus fluide, transparente et agréable 
              du marché.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Prêt à Vivre l'Expérience M-Motors ?
          </h2>
          <button
            onClick={() => navigate("/browse")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-lg transition-colors inline-flex items-center gap-2 text-lg"
          >
            Découvrir notre catalogue
            <ArrowRight size={24} />
          </button>
        </div>
      </div>

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
