import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import StatusBadge, { STATUS_LABELS } from '../components/StatusBadge';

export default function AdminPanel() {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAll = useCallback(() => {
    setLoading(true);
    setError(null);

    const reportsRequest = statusFilter
      ? api.get('/reports/query/by-status', { params: { status: statusFilter } })
      : api.get('/reports', { params: { page: 1, limit: 100 } });

    Promise.all([reportsRequest, api.get('/users')])
      .then(([reportsRes, usersRes]) => {
        setReports(statusFilter ? reportsRes.data : reportsRes.data.reports);
        setUsers(usersRes.data);
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleStatusChange = (report, status) => {
    api
      .patch(`/reports/${report._id}/status`, { status })
      .then(fetchAll)
      .catch((err) => setError(err.response?.data?.error || err.message));
  };

  const handleRoleChange = (user, role) => {
    api
      .patch(`/users/${user._id}/role`, { role })
      .then(fetchAll)
      .catch((err) => setError(err.response?.data?.error || err.message));
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Panel de administración</h1>
          <p className="page-subtitle">Gestiona el estado de los reportes y los roles de usuario.</p>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <section className="admin-section">
        <div className="admin-section-header">
          <h2>Reportes</h2>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="in_progress">En progreso</option>
            <option value="resolved">Resuelto</option>
          </select>
        </div>

        {loading && <p className="muted">Cargando…</p>}

        {!loading && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Ubicación</th>
                  <th>Usuario</th>
                  <th>Estado actual</th>
                  <th>Cambiar estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id}>
                    <td>{report.description}</td>
                    <td>{report.location}</td>
                    <td>{report.userId?.name || '—'}</td>
                    <td>
                      <StatusBadge status={report.status} />
                    </td>
                    <td>
                      <select
                        value={report.status}
                        onChange={(e) => handleStatusChange(report, e.target.value)}
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <Link to={`/reportes/${report._id}`}>Ver →</Link>
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={6} className="muted">
                      No hay reportes con este filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-section">
        <div className="admin-section-header">
          <h2>Usuarios</h2>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Cambiar rol</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge ${u.role}`}>{u.role}</span>
                  </td>
                  <td>
                    <select value={u.role} onChange={(e) => handleRoleChange(u, e.target.value)}>
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
