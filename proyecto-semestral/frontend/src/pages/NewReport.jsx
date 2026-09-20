import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import LocationPicker from '../components/LocationPicker';
import { IconCamera, IconPin } from '../components/Icons';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export default function NewReport() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ description: '', location: '' });
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización.');
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setError('No se pudo obtener tu ubicación: ' + err.message);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('La foto debe ser JPG, PNG o WebP.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('La foto no puede superar 5 MB.');
      e.target.value = '';
      return;
    }

    setError(null);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (coords.lat == null || coords.lng == null) {
      setError('Selecciona la ubicación del incidente en el mapa o usa tu ubicación actual.');
      return;
    }

    setSubmitting(true);
    try {
      let photoUrl;

      if (photoFile) {
        const data = new FormData();
        data.append('photo', photoFile);
        // No se fija el header Content-Type a mano: axios detecta que "data"
        // es un FormData y arma el boundary del multipart automáticamente.
        const uploadRes = await api.post('/uploads', data);
        photoUrl = uploadRes.data.url;
      }

      await api.post('/reports', {
        description: form.description,
        location: form.location,
        photo: photoUrl,
        lat: coords.lat,
        lng: coords.lng
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Reportar un incidente</h1>
          <p className="page-subtitle">Describe el problema, agrega una foto y marca su ubicación.</p>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} className="card-form">
        <label>
          Descripción
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="¿Qué está pasando?"
          />
        </label>

        <label>
          Dirección / referencia
          <input
            required
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Ej: Calle 10 #5-20"
          />
        </label>

        <div className="photo-field">
          <label>Evidencia fotográfica (opcional)</label>

          {!photoPreview && (
            <label className="photo-dropzone">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                hidden
              />
              <IconCamera size={20} />
              <span>Seleccionar foto</span>
              <span className="hint-small">JPG, PNG o WebP · máx. 5 MB</span>
            </label>
          )}

          {photoPreview && (
            <div className="photo-preview">
              <img src={photoPreview} alt="Vista previa" />
              <button type="button" className="btn-ghost small" onClick={removePhoto}>
                Quitar foto
              </button>
            </div>
          )}
        </div>

        <div className="map-field">
          <div className="map-field-header">
            <label>Ubicación en el mapa</label>
            <button type="button" className="btn-ghost small" onClick={useMyLocation} disabled={locating}>
              <IconPin size={13} /> {locating ? 'Localizando…' : 'Usar mi ubicación'}
            </button>
          </div>
          <LocationPicker
            lat={coords.lat}
            lng={coords.lng}
            onPick={(lat, lng) => setCoords({ lat, lng })}
          />
          <p className="hint-small">
            {coords.lat != null
              ? `Seleccionado: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
              : 'Haz clic en el mapa para marcar el punto exacto.'}
          </p>
        </div>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Enviando…' : 'Enviar reporte'}
        </button>
      </form>
    </div>
  );
}
