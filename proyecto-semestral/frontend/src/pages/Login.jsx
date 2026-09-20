import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandMark } from '../components/Icons';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div className="auth-visual-top">
          <BrandMark size={22} />
          Alerta Segura
        </div>
        <div className="auth-visual-body">
          <h2>El reporte correcto, en el punto exacto.</h2>
          <p>
            Registra incidentes de tu comunidad con foto y ubicación precisa, y sigue su estado
            de principio a fin.
          </p>
        </div>
        <div className="auth-visual-stats">
          <div>
            <strong>3</strong>
            <span>estados de seguimiento</span>
          </div>
          <div>
            <strong>100%</strong>
            <span>geolocalizado</span>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <h1 className="auth-title">Iniciar sesión</h1>
          <p className="auth-subtitle">Ingresa para reportar y hacer seguimiento a incidentes.</p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              Correo electrónico
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="tucorreo@ejemplo.com"
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </label>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Ingresando…' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="auth-footer">
            ¿No tienes cuenta? <Link to="/registro">Crear una cuenta</Link>
          </p>

          <p className="auth-hint">
            Cuenta de prueba (admin): <code>admin@alertasegura.com</code> / <code>admin123</code>
            <br />
            (creada al correr <code>npm run seed</code> en el backend)
          </p>
        </div>
      </div>
    </div>
  );
}
