// services/placesService.js
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_URL = `${API_BASE_URL}/places`;

// Lanza error y dispara cierre de sesión si el token expiró
const checkAuthError = (response) => {
  if (response.status === 401 || response.status === 403) {
    window.dispatchEvent(new Event("session-expired"));
    throw new Error("Sesión expirada");
  }
  if (!response.ok) throw new Error(`Error ${response.status}`);
};

// Obtener categorías disponibles
export const getCategories = async (token) => {
  const response = await fetch(`${API_URL}/categories/list`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  checkAuthError(response);
  return await response.json();
};

// Obtener todos los lugares con filtrado opcional
export const getPlaces = async (token, filters = {}) => {
  const queryParams = new URLSearchParams();
  if (filters.name) queryParams.append("name", filters.name);
  if (filters.category) queryParams.append("category", filters.category);
  if (filters.startDate) queryParams.append("startDate", filters.startDate);
  if (filters.endDate) queryParams.append("endDate", filters.endDate);
  if (filters.lat && filters.lng && filters.radius) {
    queryParams.append("lat", filters.lat);
    queryParams.append("lng", filters.lng);
    queryParams.append("radius", filters.radius);
  }

  const url = queryParams.toString() ? `${API_URL}?${queryParams}` : API_URL;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  checkAuthError(response);
  return await response.json();
};

// Obtener un lugar por ID
export const getPlaceById = async (id, token) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  checkAuthError(response);
  return await response.json();
};

// Agregar un nuevo lugar
export const addPlace = async (name, coords, token, category = "Otro") => {
  const lat = typeof coords === "string" ? Number(coords.split(",")[0]) : coords.lat;
  const lng = typeof coords === "string" ? Number(coords.split(",")[1]) : coords.lng;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, lat, lng, category }),
  });
  checkAuthError(response);
  return await response.json();
};

// Actualizar un lugar por ID
export const updatePlace = async (id, updatedFields, token) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedFields),
  });
  checkAuthError(response);
  return await response.json();
};

// Eliminar un lugar por ID
export const deletePlace = async (id, token) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  checkAuthError(response);
  return await response.json();
};
