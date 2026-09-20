import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { resolvePhotoUrl } from '../api/client';
import StatusBadge, { STATUS_LABELS } from '../components/StatusBadge';
import StaticLocationMap from '../components/StaticLocationMap';
import { IconPin, IconUser, IconZoom, IconArrowLeft } from '../components/Icons';

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get(`/reports/${id}`)
      .then((res) => setReport(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = (status) => {
    setSavingStatus(true);
    api
      .patch(`/reports/${id}/status`, { status })
      .then((res) => setReport(res.data))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setSavingStatus(false));
  };

  const handleDelete = () => {
    if (!window.confirm('¿Eliminar este reporte? Esta acción no se puede deshacer.')) return;
    api
      .delete(`/reports/${id}`)
      .then(() => navigate('/'))
      .catch((err) => setError(err.response?.data?.message || err.message));
  };

  if (loading) return <div className="page-loading">Cargando reporte…</div>;

  if (error && !report) {
    return (
      <div className="page">
        <div className="error-box">{error}</div>
        <Link to="/" className="btn-ghost">
          ← Volver a reportes
        </Link>
      </div>
    );
  }

  if (!report) return null;

  const isOwner = report.userId?._id === user?.id;
  const canManage = isOwner || isAdmin;

  return (
    <div className="page">
      <Link to="/" className="back-link">
        <IconArrowLeft size={14} /> Volver a reportes
      </Link>

      {error && <div className="error-box">{error}</div>}

      <div className="detail-layout">
        <div className="detail-main">
          {report.photo ? (
            <button className="detail-photo-btn" onClick={() => setLightboxOpen(true)}>
              <img className="detail-photo" src={resolvePhotoUrl(report.photo)} alt="" />
              <span className="detail-photo-hint">
                <IconZoom size={12} /> Ver en grande
              </span>
            </button>
          ) : (
            <div className="detail-photo detail-photo-empty">
              <IconPin size={16} /> Sin foto adjunta
            </div>
          )}

          <div className="detail-header">
            <StatusBadge status={report.status} />
            <span className="detail-date">
              Reportado el{' '}
              {new Date(report.createdAt).toLocaleDateString('es-CO', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>

          <h1>{report.description}</h1>

          <div className="detail-meta">
            <p>
              <IconPin size={14} className="i" /> {report.location}
            </p>
            {report.userId?.name && (
              <p>
                <IconUser size={14} className="i" /> Reportado por {report.userId.name}
              </p>
            )}
          </div>

          {canManage && (
            <div className="detail-actions">
              <button className="btn-danger-ghost" onClick={handleDelete}>
                Eliminar reporte
              </button>
            </div>
          )}
        </div>

        <aside className="detail-side">
          <div className="detail-card">
            <h3>Ubicación</h3>
            {report.lat != null ? (
              <StaticLocationMap lat={report.lat} lng={report.lng} />
            ) : (
              <p className="muted">Este reporte no tiene coordenadas guardadas.</p>
            )}
          </div>

          {isAdmin && (
            <div className="detail-card">
              <h3>Gestionar estado</h3>
              <p className="hint-small">Solo los administradores pueden cambiar el estado.</p>
              <div className="status-options">
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    className={`status-option ${report.status === value ? 'active' : ''}`}
                    disabled={savingStatus}
                    onClick={() => handleStatusChange(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {lightboxOpen && (
        <div className="lightbox" onClick={() => setLightboxOpen(false)}>
          <img src={resolvePhotoUrl(report.photo)} alt="" />
        </div>
      )}
    </div>
  );
}
