import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { AppModal } from "../components/AppModal.jsx";
import {
  createSupportTicket,
  getSupportMetrics,
  getSupportTickets,
  updateSupportTicket,
} from "../services/supportService.js";

const initialForm = {
  title: "",
  description: "",
  type: "bug",
  priority: "media",
};

const metricLabelMap = {
  abierto: "Abiertos",
  en_progreso: "En progreso",
  resuelto: "Resueltos",
  baja: "Prioridad baja",
  media: "Prioridad media",
  alta: "Prioridad alta",
};

const Support = () => {
  const { user, handleLogout } = useContext(AuthContext);
  const token = user?.token ?? localStorage.getItem("token");
  const [form, setForm] = useState(initialForm);
  const [tickets, setTickets] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "" });

  const showModal = (title, message) => {
    setModal({ isOpen: true, title, message });
  };

  const loadSupportData = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const [ticketData, metricsData] = await Promise.all([
        getSupportTickets(token),
        getSupportMetrics(token),
      ]);
      setTickets(ticketData);
      setMetrics(metricsData);
    } catch (error) {
      showModal("Error al cargar soporte", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSupportData();
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const ticket = await createSupportTicket(form, token);
      setTickets((current) => [ticket, ...current]);
      setForm(initialForm);
      const metricsData = await getSupportMetrics(token);
      setMetrics(metricsData);
      showModal("Ticket creado", "El ticket fue registrado correctamente.");
    } catch (error) {
      showModal("No se pudo crear el ticket", error.message);
    }
  };

  const handleStatusChange = async (ticketId, status) => {
    try {
      const updated = await updateSupportTicket(ticketId, { status }, token);
      setTickets((current) => current.map((ticket) => (ticket._id === ticketId ? updated : ticket)));
      const metricsData = await getSupportMetrics(token);
      setMetrics(metricsData);
      showModal("Estado actualizado", "El ticket cambió de estado correctamente.");
    } catch (error) {
      showModal("No se pudo actualizar", error.message);
    }
  };

  return (
    <div className="app-main" style={{ padding: "1.5rem" }}>
      <header style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "1.5rem" }}>🛠️</span>
        <h1 style={{ marginRight: "auto" }}>Soporte y métricas</h1>
        <div className="header-actions">
          <Link className="header-action-link" to="/home">Volver al mapa</Link>
          <button type="button" className="header-action-btn" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </header>

      <section style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ background: "white", borderRadius: "var(--radius)", padding: "1rem", boxShadow: "var(--shadow)" }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Nuevo ticket</h2>
          <form onSubmit={handleSubmit}>
            <input
              className="input-field"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Título del problema"
              required
            />
            <textarea
              className="input-field"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe el bug, mejora o consulta"
              rows={4}
              required
              style={{ resize: "vertical" }}
            />
            <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", marginBottom: "1rem" }}>
              <select className="input-field" name="type" value={form.type} onChange={handleChange} style={{ marginBottom: 0 }}>
                <option value="bug">Bug</option>
                <option value="mejora">Mejora</option>
                <option value="consulta">Consulta</option>
              </select>
              <select className="input-field" name="priority" value={form.priority} onChange={handleChange} style={{ marginBottom: 0 }}>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
            <button className="btn-primary" type="submit">Crear ticket</button>
          </form>
        </div>

        <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
          <div style={{ background: "white", borderRadius: "var(--radius)", padding: "1rem", boxShadow: "var(--shadow)" }}>
            <small>Lugares creados</small>
            <h3>{metrics?.placesCount ?? 0}</h3>
          </div>
          <div style={{ background: "white", borderRadius: "var(--radius)", padding: "1rem", boxShadow: "var(--shadow)" }}>
            <small>Errores últimos 7 días</small>
            <h3>{metrics?.errorsLast7Days ?? 0}</h3>
          </div>
          <div style={{ background: "white", borderRadius: "var(--radius)", padding: "1rem", boxShadow: "var(--shadow)" }}>
            <small>Fallos de login últimos 7 días</small>
            <h3>{metrics?.loginErrorsLast7Days ?? 0}</h3>
          </div>
        </div>

        <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          {Object.entries(metrics?.ticketsByStatus ?? {}).map(([key, value]) => (
            <div key={key} style={{ background: "white", borderRadius: "var(--radius)", padding: "1rem", boxShadow: "var(--shadow)" }}>
              <small>{metricLabelMap[key] ?? key}</small>
              <h3>{value}</h3>
            </div>
          ))}
          {Object.entries(metrics?.ticketsByPriority ?? {}).map(([key, value]) => (
            <div key={key} style={{ background: "white", borderRadius: "var(--radius)", padding: "1rem", boxShadow: "var(--shadow)" }}>
              <small>{metricLabelMap[key] ?? key}</small>
              <h3>{value}</h3>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Tickets simulados</h2>
        {isLoading ? (
          <p>Cargando soporte...</p>
        ) : tickets.length === 0 ? (
          <p>Aún no hay tickets. Crea el primero para simular post-desarrollo.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {tickets.map((ticket) => (
              <article key={ticket._id} style={{ background: "white", borderRadius: "var(--radius)", padding: "1rem", boxShadow: "var(--shadow)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "flex-start" }}>
                  <div>
                    <strong>{ticket.title}</strong>
                    <p style={{ margin: "0.35rem 0", color: "var(--color-secondary)" }}>{ticket.description}</p>
                    <small>
                      Tipo: {ticket.type} | Prioridad: {ticket.priority} | Creado: {new Date(ticket.createdAt).toLocaleString("es-AR")}
                    </small>
                  </div>
                  <select
                    className="input-field"
                    value={ticket.status}
                    onChange={(event) => handleStatusChange(ticket._id, event.target.value)}
                    style={{ width: "150px", marginBottom: 0 }}
                  >
                    <option value="abierto">Abierto</option>
                    <option value="en_progreso">En progreso</option>
                    <option value="resuelto">Resuelto</option>
                  </select>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <AppModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        confirmText="Aceptar"
        onConfirm={() => setModal((current) => ({ ...current, isOpen: false }))}
        onClose={() => setModal((current) => ({ ...current, isOpen: false }))}
      />
    </div>
  );
};

export { Support };