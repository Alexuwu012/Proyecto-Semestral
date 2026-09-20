import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandMark } from '../components/Icons';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear la cuenta');
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
          <h2>Súmate a la red de reporte ciudadano.</h2>
          <p>
            Crea tu cuenta para reportar incidentes en tu zona, subir evidencia fotográfica y
            hacer seguimiento a cada caso.
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
          <h1 className="auth-title">Crear cuenta</h1>
          <p className="auth-subtitle">Regístrate para poder reportar incidentes en tu zona.</p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              Nombre completo
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nombre y apellido"
              />
            </label>
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
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
              />
            </label>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>

          <p className="auth-footer">
            ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
