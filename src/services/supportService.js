const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_URL = `${API_BASE_URL}/support`;

const buildHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const getSupportTickets = async (token) => {
  const response = await fetch(`${API_URL}/tickets`, {
    headers: buildHeaders(token),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Error al cargar tickets");
  return data;
};

export const createSupportTicket = async (payload, token) => {
  const response = await fetch(`${API_URL}/tickets`, {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Error al crear ticket");
  return data;
};

export const updateSupportTicket = async (id, payload, token) => {
  const response = await fetch(`${API_URL}/tickets/${id}`, {
    method: "PATCH",
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Error al actualizar ticket");
  return data;
};

export const getSupportMetrics = async (token) => {
  const response = await fetch(`${API_URL}/metrics`, {
    headers: buildHeaders(token),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Error al cargar métricas");
  return data;
};