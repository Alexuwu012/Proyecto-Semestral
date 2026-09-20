import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { resolvePhotoUrl } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { IconPin, IconUser, IconArrowLeft, IconArrowRight } from '../components/Icons';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, resolved: 0 });

  const fetchReports = useCallback(() => {
    setLoading(true);
    setError(null);

    const request = statusFilter
      ? api.get('/reports/query/by-status', { params: { status: statusFilter } })
      : api.get('/reports', { params: { page, limit } });

    request
      .then((response) => {
        if (statusFilter) {
          setReports(response.data);
          setTotalPages(1);
        } else {
          setReports(response.data.reports);
          setTotalPages(response.data.totalPages || 1);
        }
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [page, limit, statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Estadísticas globales (independientes de la paginación/filtro de la lista).
  useEffect(() => {
    api
      .get('/reports', { params: { page: 1, limit: 1000 } })
      .then((res) => {
        const all = res.data.reports || [];
        setStats({
          total: res.data.total ?? all.length,
          pending: all.filter((r) => r.status === 'pending').length,
          in_progress: all.filter((r) => r.status === 'in_progress').length,
          resolved: all.filter((r) => r.status === 'resolved').length
        });
      })
      .catch(() => {});
  }, [reports]);

  const handleDelete = (id) => {
    if (!window.confirm('¿Eliminar este reporte?')) return;
    api
      .delete(`/reports/${id}`)
      .then(fetchReports)
      .catch((err) => setError(err.response?.data?.message || err.message));
  };

  const canManage = (report) => isAdmin || report.userId?._id === user?.id;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Reportes</h1>
          <p className="page-subtitle">Incidentes reportados por la comunidad.</p>
        </div>
        <div className="toolbar">
          <label>Estado:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="in_progress">En progreso</option>
            <option value="resolved">Resuelto</option>
          </select>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Reportes</span>
        </div>
        <div className="stat-card stat-pending">
          <span className="stat-value">{stats.pending}</span>
          <span className="stat-label">Pendientes</span>
        </div>
        <div className="stat-card stat-progress">
          <span className="stat-value">{stats.in_progress}</span>
          <span className="stat-label">En progreso</span>
        </div>
        <div className="stat-card stat-resolved">
          <span className="stat-value">{stats.resolved}</span>
          <span className="stat-label">Resueltos</span>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}
      {loading && <p className="muted">Cargando reportes…</p>}
      {!loading && !error && reports.length === 0 && (
        <p className="muted">No hay reportes todavía. Sé el primero en reportar uno.</p>
      )}

      <div className="report-grid">
        {!loading &&
          reports.map((report) => (
            <article className="report-card" key={report._id}>
              <Link to={`/reportes/${report._id}`} className="report-card-link">
                {report.photo ? (
                  <img className="report-photo" src={resolvePhotoUrl(report.photo)} alt="" />
                ) : (
                  <div className="report-photo report-photo-empty">
                    <IconPin size={26} />
                  </div>
                )}
                <div className="report-body">
                  <div className="report-top">
                    <StatusBadge status={report.status} />
                  </div>
                  <h3>{report.description}</h3>
                  <p className="report-location">
                    <IconPin size={13} className="i" /> {report.location}
                  </p>
                  {report.userId?.name && (
                    <p className="report-author">
                      <IconUser size={13} className="i" /> {report.userId.name}
                    </p>
                  )}
                </div>
              </Link>

              {canManage(report) && (
                <div className="report-actions">
                  {!isAdmin && (
                    <span className="hint-small">Solo un administrador puede cambiar el estado</span>
                  )}
                  <button
                    className="btn-danger-ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(report._id);
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </article>
          ))}
      </div>

      {!statusFilter && !loading && totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <IconArrowLeft size={14} /> Anterior
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Siguiente <IconArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
