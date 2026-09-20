import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandMark, IconLogout } from './Icons';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand">
          <BrandMark size={24} className="brand-mark" /> Alerta Segura
        </NavLink>

        {user && (
          <nav className="nav-links">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
              Reportes
            </NavLink>
            <NavLink to="/mapa" className={({ isActive }) => (isActive ? 'active' : '')}>
              Mapa
            </NavLink>
            <NavLink to="/nuevo" className={({ isActive }) => (isActive ? 'active' : '')}>
              Reportar
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
                Administración
              </NavLink>
            )}
          </nav>
        )}

        <div className="navbar-user">
          {user ? (
            <>
              <span className="user-pill">
                {user.name}
                {isAdmin && <span className="role-tag">admin</span>}
              </span>
              <button className="btn-ghost" onClick={handleLogout}>
                <IconLogout /> Salir
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn-ghost">
              Iniciar sesión
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}
