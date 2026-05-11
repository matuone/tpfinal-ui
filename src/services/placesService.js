// services/placesService.js
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_URL = `${API_BASE_URL}/places`;

// Helper para obtener el token desde localStorage

// Obtener todos los lugares
export const getPlaces = async (token) => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Error al obtener lugares");
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
  if (!response.ok) throw new Error("Lugar no encontrado");
  return await response.json();
};

// Agregar un nuevo lugar
export const addPlace = async (name, coords, token) => {
  const lat = typeof coords === "string" ? Number(coords.split(",")[0]) : coords.lat;
  const lng = typeof coords === "string" ? Number(coords.split(",")[1]) : coords.lng;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, lat, lng }),
  });
  if (!response.ok) throw new Error("Error al crear lugar");
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
  if (!response.ok) throw new Error("Error al actualizar lugar");
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
  if (!response.ok) throw new Error("Error al eliminar lugar");
  return await response.json();
};
