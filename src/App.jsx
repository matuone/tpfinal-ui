import { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { usePlaces } from './context/PlacesContext';
import { RuteandoMap } from './components/Map';
import { AuthContext } from './context/AuthContext';
import { AppModal } from './components/AppModal.jsx';
import { getCategories } from './services/placesService';

const RuteandoApp = () => {
  const [placeName, setPlaceName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Otro');
  const [isMobileDevice, setIsMobileDevice] = useState(true);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [focusedCoords, setFocusedCoords] = useState(null);
  const [categories, setCategories] = useState([]);
  const mapSectionRef = useRef(null);

  // Filtros
  const [filterName, setFilterName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [modal, setModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    inputValue: '',
    onConfirm: null,
  });

  const { places, addNewPlace, updateExistingPlace, deleteExistingPlace } = usePlaces();
  const { user, handleLogout } = useContext(AuthContext);
  const token = user?.token ?? localStorage.getItem('token');

  const fallbackCategories = ['Restaurante', 'Parque', 'Museo', 'Tienda', 'Playa', 'Montaña', 'Otro'];

  // Cargar categorías
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories(token);
        const nextCategories = Array.isArray(data.categories) && data.categories.length > 0
          ? data.categories
          : fallbackCategories;
        setCategories(nextCategories);
      } catch (error) {
        console.error('Error cargando categorías:', error);
        setCategories(fallbackCategories);
      }
    };
    loadCategories();
  }, [token]);

  const openInfoModal = (title, message) => {
    setModal({
      isOpen: true,
      type: 'info',
      title,
      message,
      confirmText: 'Aceptar',
      cancelText: 'Cancelar',
      inputValue: '',
      onConfirm: () => setModal((current) => ({ ...current, isOpen: false })),
    });
  };

  const closeModal = () => {
    setModal((current) => ({ ...current, isOpen: false }));
  };

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    setIsMobileDevice(mobileRegex.test(userAgent.toLowerCase()));
  }, []);

  const getBestGeolocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no disponible en este dispositivo.'));
        return;
      }

      let bestPosition = null;
      const targetAccuracy = 80;
      const maxWaitMs = 20000;
      let resolved = false;

      const finish = (handler) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(fallbackTimer);
        navigator.geolocation.clearWatch(watcherId);
        handler();
      };

      const watcherId = navigator.geolocation.watchPosition(
        (position) => {
          if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
            bestPosition = position;
          }

          if (position.coords.accuracy <= targetAccuracy) {
            finish(() => resolve(position));
          }
        },
        () => {
          finish(() => reject(new Error('No se pudo obtener tu ubicación.')));
        },
        {
          enableHighAccuracy: true,
          timeout: maxWaitMs,
          maximumAge: 0,
        }
      );

      const fallbackTimer = setTimeout(() => {
        finish(() => {
          if (!bestPosition) {
            reject(new Error('No se pudo obtener una lectura de ubicación.'));
            return;
          }

          resolve(bestPosition);
        });
      }, maxWaitMs);
    });
  };

  const handleSavePlace = async (e) => {
    e.preventDefault();
    if (!placeName.trim()) {
      openInfoModal('Nombre requerido', 'Por favor, dale un nombre a este rincón.');
      return;
    }

    if (selectedCoords) {
      await addNewPlace(placeName, {
        lat: selectedCoords[0],
        lng: selectedCoords[1],
      }, selectedCategory);

      setPlaceName('');
      setSelectedCategory('Otro');
      setSelectedCoords(null);
      openInfoModal('Lugar guardado', '📍 ¡Lugar guardado con el punto manual del mapa!');
      return;
    }

    try {
      const pos = await getBestGeolocation();
      const accuracy = Math.round(pos.coords.accuracy);

      if (accuracy > 120) {
        const extraHint = accuracy > 1000
          ? ' Si estás probando en emulador/navegador desktop, configura la ubicación en sensores del navegador o prueba desde el teléfono real.'
          : '';

        openInfoModal(
          'Ubicación poco precisa',
          `La precisión actual es de ${accuracy} m. Para mejorarla, activa la ubicación precisa, espera unos segundos a cielo abierto y vuelve a intentar. También puedes usar "Elegir en mapa" para marcar el punto exacto.${extraHint}`
        );
        return;
      }

      const coords = {
        lat: Number(pos.coords.latitude.toFixed(6)),
        lng: Number(pos.coords.longitude.toFixed(6)),
      };

      await addNewPlace(placeName, coords, selectedCategory);
      setPlaceName('');
      setSelectedCategory('Otro');
      setSelectedCoords(null);
      openInfoModal('Lugar guardado', `📍 ¡Lugar guardado con éxito! Precisión aprox: ${accuracy} m.`);
    } catch (error) {
      openInfoModal('Permiso de ubicación', error.message || "Para rutear un lugar, necesitamos acceso a tu ubicación actual.");
      console.log(error);
    }
  };

  // Ícono por categoría
  const getCategoryIcon = (category) => {
    const icons = {
      'Restaurante': '🍽️',
      'Parque': '🌳',
      'Museo': '🎨',
      'Tienda': '🏪',
      'Playa': '🏖️',
      'Montaña': '⛰️',
      'Otro': '📍'
    };
    return icons[category] || '📍';
  };

  // Filtrar lugares según criterios
  const filteredPlaces = places.filter(p => {
    const matchesName = filterName === '' || p.name.toLowerCase().includes(filterName.toLowerCase());
    const matchesCategory = filterCategory === '' || p.category === filterCategory;
    return matchesName && matchesCategory;
  });

  const focusPlaceOnMap = (place) => {
    const coords = [Number(place.lat), Number(place.lng)];
    setFocusedCoords(coords);

    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (!isMobileDevice) {
    return (
      <div className="desktop-notice" style={{ display: 'flex', textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ color: 'var(--color-primary)' }}>📍 Ruteando</h1>
        <p>Esta es una <strong>bitácora de exploración física</strong>.</p>
        <p>Para mantener la esencia de la app, por favor ábrela desde tu <strong>teléfono móvil</strong>.</p>
      </div>
    );
  }

  return (
    <div className="app-main" style={{ padding: '1.5rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.5rem' }}>📍</span>
        <h1>Mis Rutas</h1>
        <div className="header-actions">
          <Link className="header-action-link" to="/support">Soporte</Link>
          <button type="button" className="header-action-btn" onClick={() => handleLogout()}>Cerrar sesión</button>
        </div>
      </header>

      <form onSubmit={handleSavePlace} className="add-place-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-secondary)' }}>¿Dónde estás ahora?</h3>
        <input
          className="input-field"
          value={placeName}
          placeholder="Nombre del sitio (ej: Mi café favorito)"
          onChange={(e) => setPlaceName(e.target.value)}
        />

        <select
          className="input-field"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ marginTop: '0.5rem' }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{getCategoryIcon(cat)} {cat}</option>
          ))}
        </select>

        <button className="btn-primary">
          Registrar este lugar
        </button>

        {selectedCoords ? (
          <small style={{ display: 'block', marginTop: '0.75rem', color: 'var(--color-secondary)' }}>
            Punto manual seleccionado: {selectedCoords[0]}, {selectedCoords[1]}
          </small>
        ) : null}
      </form>

      <div ref={mapSectionRef}>
        <RuteandoMap
          selectedCoords={selectedCoords}
          focusedCoords={focusedCoords}
          onSelectedCoordsChange={setSelectedCoords}
        />
      </div>

      <div className="filters-section" style={{ marginTop: '2rem', background: '#f9f9f9', padding: '1rem', borderRadius: 'var(--radius)' }}>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            color: 'var(--color-primary)',
            fontWeight: 'bold',
            width: '100%',
            textAlign: 'left'
          }}
        >
          {showFilters ? '▼' : '▶'} Filtros {filteredPlaces.length !== places.length && `(${filteredPlaces.length}/${places.length})`}
        </button>

        {showFilters && (
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Buscar por nombre..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
            <select
              className="input-field"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{getCategoryIcon(cat)} {cat}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="history-section" style={{ marginTop: '2.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Bitácora de sitios</h2>
        {filteredPlaces.length === 0 ? (
          <p style={{ color: '#999', fontStyle: 'italic' }}>Tu mapa aún está vacío. ¡Sal a explorar!</p>
        ) : (
          <ul style={{ listStyle: 'none' }}>
            {filteredPlaces.map(p => {
              const { _id: id } = p;
              return (
                <li key={id} style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: 'var(--radius)',
                  marginBottom: '1rem',
                  borderLeft: '5px solid var(--color-primary)'
                }}>
                  <button
                    type="button"
                    onClick={() => focusPlaceOnMap(p)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: 'inherit'
                    }}
                  >
                    <strong style={{ fontSize: '1.1rem', textDecoration: 'underline' }}>{getCategoryIcon(p.category)} {p.name}</strong>
                  </button>
                  <br />
                  {p.category && <small style={{ color: 'var(--color-secondary)' }}>📂 {p.category}</small>}
                  <br />
                  <small style={{ color: 'var(--color-secondary)' }}>🏠 {p.address || `${p.lat}, ${p.lng}`}</small> <br />
                  <small style={{ color: '#bbb' }}>
                    Registrado el {new Date(p.date).toLocaleString('es-AR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </small>

                  {/* Botones CRUD */}
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setModal({
                          isOpen: true,
                          type: 'prompt',
                          title: 'Editar lugar',
                          message: 'Escribe el nuevo nombre para este lugar.',
                          confirmText: 'Guardar',
                          cancelText: 'Cancelar',
                          inputValue: p.name,
                          onConfirm: (value) => {
                            const trimmed = value.trim();
                            if (trimmed) {
                              updateExistingPlace(p._id, { name: trimmed });
                              closeModal();
                            } else {
                              openInfoModal('Nombre requerido', 'El nombre del lugar no puede quedar vacío.');
                            }
                          },
                        });
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => {
                        setModal({
                          isOpen: true,
                          type: 'confirm',
                          title: 'Eliminar lugar',
                          message: `¿Eliminar "${p.name}" de tu bitácora?`,
                          confirmText: 'Eliminar',
                          cancelText: 'Cancelar',
                          inputValue: '',
                          onConfirm: () => {
                            deleteExistingPlace(p._id);
                            closeModal();
                          },
                        });
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <AppModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        inputValue={modal.inputValue}
        inputPlaceholder="Nombre del lugar"
        onInputChange={(value) => setModal((current) => ({ ...current, inputValue: value }))}
        onConfirm={() => {
          if (!modal.onConfirm) return closeModal();
          if (modal.type === 'prompt') {
            modal.onConfirm(modal.inputValue || '');
            return;
          }
          modal.onConfirm();
        }}
        onClose={closeModal}
      />
    </div>
  );
};

export { RuteandoApp };