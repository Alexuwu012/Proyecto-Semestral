import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3000/reports?page=1&limit=10')
      .then((response) => {
        setReports(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Cargando reportes...</p>;
  }

  if (error) {
    return <p>Error al cargar los reportes: {error}</p>;
  }

  return (
    <div>
      <h1>Reportes - Alerta Segura</h1>
      <pre>{JSON.stringify(reports, null, 2)}</pre>
    </div>
  );
}

export default App;