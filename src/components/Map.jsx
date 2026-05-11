import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// Importamos los lugares desde el contexto que ya creaste [4]
import { usePlaces } from '../context/PlacesContext';

// Componente auxiliar para centrar el mapa automáticamente [5]
const RecenterMap = ({ coords }) => {
  const map = useMap();

  useEffect(() => {
    if (!coords || !map || !map.getContainer()) return;

    // En iOS/Safari puede fallar la transición de zoom al desmontar; movemos sin animación.
    map.setView(coords, 16, { animate: false });
  }, [coords, map]);

  return null;
};

const PickLocationOnClick = ({ isPicking, onPick }) => {
  useMapEvents({
    click(event) {
      if (!isPicking) return;

      onPick([
        Number(event.latlng.lat.toFixed(6)),
        Number(event.latlng.lng.toFixed(6)),
      ]);
    },
  });

  return null;
};

const RuteandoMap = ({ selectedCoords, onSelectedCoordsChange }) => {
  const { places } = usePlaces(); // Acceso a la lista de bitácora [4]
  const [currentCoords, setCurrentCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const [locationHint, setLocationHint] = useState('');

  // Determinamos el centro: el último lugar visitado o una posición por defecto [5]
  const latestPlace = [...places].sort((first, second) => {
    return new Date(second.date).getTime() - new Date(first.date).getTime();
  })[0];
  const placeCenter = latestPlace ? [Number(latestPlace.lat), Number(latestPlace.lng)] : [-34.6037, -58.3816];
  const mapCenter = useMemo(() => selectedCoords || currentCoords || placeCenter, [selectedCoords, currentCoords, placeCenter]);
  const initialZoom = latestPlace ? 16 : 12;

  const focusMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationHint('Este dispositivo no soporta geolocalización.');
      return;
    }

    setIsLocating(true);
    setLocationHint('Buscando tu ubicación...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoords = [
          Number(position.coords.latitude.toFixed(6)),
          Number(position.coords.longitude.toFixed(6)),
        ];
        setCurrentCoords(nextCoords);
        if (onSelectedCoordsChange) {
          onSelectedCoordsChange(nextCoords);
        }
        setIsLocating(false);
        setLocationHint(`Ubicación encontrada (±${Math.round(position.coords.accuracy)} m).`);
      },
      () => {
        setIsLocating(false);
        setLocationHint('No pudimos obtener tu ubicación actual.');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handlePickLocation = (coords) => {
    if (onSelectedCoordsChange) {
      onSelectedCoordsChange(coords);
    }
    setIsPicking(false);
    setLocationHint('Punto manual seleccionado en el mapa.');
  };

  return (
    <div className="map-shell" style={{ height: '300px', width: '100%', borderY: '1px solid var(--color-secondary)' }}>
      <button
        type="button"
        className="map-locate-btn"
        onClick={focusMyLocation}
        disabled={isLocating}
      >
        {isLocating ? 'Ubicando...' : 'Mi ubicación'}
      </button>

      <button
        type="button"
        className={`map-locate-btn map-pick-btn ${isPicking ? 'is-active' : ''}`}
        onClick={() => {
          const nextValue = !isPicking;
          setIsPicking(nextValue);
          setLocationHint(nextValue ? 'Toca un punto en el mapa para fijar tu ubicación manual.' : 'Selección manual cancelada.');
        }}
      >
        {isPicking ? 'Cancelar punto' : 'Elegir en mapa'}
      </button>

      <MapContainer
        center={mapCenter}
        zoom={initialZoom}
        zoomAnimation={false}
        markerZoomAnimation={false}
        fadeAnimation={false}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Renderizado dinámico de tu bitácora de lugares [6] */}
        {places.map((place) => {

          return (
            <Marker
              key={place._id}
              position={[place.lat, place.lng]}
            >
              <Popup>
                <div style={{ fontFamily: 'Poppins', textAlign: 'center' }}>
                  <strong style={{ color: 'var(--color-primary)' }}>
                    {place.name}
                  </strong><br />
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-secondary)' }}>
                    ¡Lugar ruteado! 📍
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {currentCoords ? (
          <Marker position={currentCoords}>
            <Popup>
              <div style={{ fontFamily: 'Poppins', textAlign: 'center' }}>
                <strong style={{ color: 'var(--color-secondary)' }}>Estás aquí</strong>
              </div>
            </Popup>
          </Marker>
        ) : null}

        {selectedCoords ? (
          <Marker position={selectedCoords}>
            <Popup>
              <div style={{ fontFamily: 'Poppins', textAlign: 'center' }}>
                <strong style={{ color: 'var(--color-primary)' }}>Punto para guardar</strong>
              </div>
            </Popup>
          </Marker>
        ) : null}

        <PickLocationOnClick isPicking={isPicking} onPick={handlePickLocation} />

        {/* Efecto de centrado automático al abrir la app [5] */}
        <RecenterMap coords={mapCenter} />
      </MapContainer>

      {locationHint ? (
        <small className="map-location-hint">{locationHint}</small>
      ) : null}
    </div >
  );
};

export { RuteandoMap }