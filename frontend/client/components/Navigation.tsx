import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Car, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

interface UserData {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  is_admin?: boolean;
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Erreur de chargement du profil", err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
    setIsProfileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-primary">
            <Car size={28} />
            <span>Bloc03_Baers</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/browse" className="text-slate-700 hover:text-primary transition-colors">
              Parcourir
            </Link>
            <Link to="/services" className="text-slate-700 hover:text-primary transition-colors">
              Services
            </Link>
            <Link to="/about" className="text-slate-700 hover:text-primary transition-colors">
              À propos
            </Link>
            <a href="mailto:contact@m-motors.fr" className="text-slate-700 hover:text-primary transition-colors">
              Contact
            </a>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <User size={20} />
                  <span className="text-slate-700">{user.firstname}</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-50">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-100 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Mon Profil
                    </Link>
                    {user.is_admin && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-slate-700 hover:bg-slate-100 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/signup"
                className="btn-primary"
              >
                S'inscrire
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3 border-t border-slate-200 pt-4">
            <Link
              to="/browse"
              className="block px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Parcourir
            </Link>
            <a
              href="#"
              className="block px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Services
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              À propos
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Contact
            </a>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Mon Profil
                </Link>
                {user.is_admin && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left block px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Se déconnecter
                </button>
              </>
            ) : (
              <Link
                to="/signup"
                className="block w-full btn-primary text-center"
                onClick={() => setIsOpen(false)}
              >
                S'inscrire
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
