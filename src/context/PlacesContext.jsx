// PlacesContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { getPlaces, addPlace, updatePlace, deletePlace } from '../services/placesService.js';
import { AuthContext } from './AuthContext.jsx';


const PlacesContext = createContext();

export const PlacesProvider = ({ children }) => {
  const [places, setPlaces] = useState([]);
  const { user } = useContext(AuthContext);
  const token = user?.token ?? localStorage.getItem("token");

  const fetchingPlaces = async () => {
    try {
      const data = await getPlaces(token);
      setPlaces(data);
    } catch (error) {
      console.error("Error al cargar lugares:", error);
    }
  };

  // Cargar lugares al iniciar
  useEffect(() => {
    if (!token) {
      setPlaces([]);
      return;
    }

    fetchingPlaces();
  }, [token]);

  // Funciones expuestas
  const addNewPlace = async (name, coords, category = 'Otro') => {
    try {
      const newPlace = await addPlace(name, coords, token, category);
      setPlaces(prev => [newPlace, ...prev]);
      return newPlace;
    } catch (error) {
      console.error("Error al agregar lugar:", error);
    }
  };

  const updateExistingPlace = async (id, fields) => {
    try {
      const updated = await updatePlace(id, fields, token);
      setPlaces(prev => prev.map((place) => (place._id === id ? updated : place)));
      return updated;
    } catch (error) {
      console.error("Error al actualizar lugar:", error);
    }
  };

  const deleteExistingPlace = async (id) => {
    try {
      await deletePlace(id, token);
      setPlaces(prev => prev.filter((place) => place._id !== id));
    } catch (error) {
      console.error("Error al eliminar lugar:", error);
    }
  };

  return (
    <PlacesContext.Provider value={{ places, addNewPlace, updateExistingPlace, deleteExistingPlace }}>
      {children}
    </PlacesContext.Provider>
  );
};

// Hook para consumir el contexto
export const usePlaces = () => useContext(PlacesContext);
