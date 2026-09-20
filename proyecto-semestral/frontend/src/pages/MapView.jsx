import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import api, { resolvePhotoUrl } from '../api/client';
import StatusBadge from '../components/StatusBadge';

const ICONS = {
  pending: L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  }),
  in_progress: L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    className: 'marker-in-progress'
  }),
  resolved: L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    className: 'marker-resolved'
  })
};

export default function MapView() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/reports/map')
      .then((res) => setReports(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  const center = reports.length
    ? [reports[0].lat, reports[0].lng]
    : [4.4389, -75.2322]; // Ibagué, Tolima por defecto

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Mapa de incidentes</h1>
          <p className="page-subtitle">Ubicación geográfica de los reportes registrados.</p>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}
      {loading && <p className="muted">Cargando mapa…</p>}

      {!loading && (
        <div className="map-page-container">
          <MapContainer center={center} zoom={13} style={{ height: '520px', width: '100%', borderRadius: '12px' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {reports.map((r) => (
              <Marker key={r._id} position={[r.lat, r.lng]} icon={ICONS[r.status] || ICONS.pending}>
                <Popup>
                  {r.photo && (
                    <img
                      src={resolvePhotoUrl(r.photo)}
                      alt=""
                      style={{ width: '100%', maxWidth: 180, borderRadius: 6, marginBottom: 6 }}
                    />
                  )}
                  <strong>{r.description}</strong>
                  <br />
                  {r.location}
                  <br />
                  <StatusBadge status={r.status} />
                  {r.userId?.name && (
                    <>
                      <br />
                      {r.userId.name}
                    </>
                  )}
                  <br />
                  <Link to={`/reportes/${r._id}`}>Ver reporte →</Link>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
}
