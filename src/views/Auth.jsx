import { useContext } from 'react';
import { useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { AppModal } from '../components/AppModal.jsx';

const Auth = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });

  const { handleLogin, handleRegister } = useContext(AuthContext);

  const showModal = (title, message) => {
    setModal({ isOpen: true, title, message });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const message = isRegister
        ? await handleRegister(email, password)
        : await handleLogin(email, password);

      showModal('Operación exitosa', message);
    } catch (error) {
      showModal('No se pudo continuar', error.message);
    }
  };

  return (
    <div className="auth-container" style={{ padding: '2.5rem 1.5rem' }}>
      <h1 style={{ textAlign: 'center', fontSize: '2.5rem', color: 'var(--color-primary)' }}>
        Ruteando
      </h1>
      <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-secondary)' }}>
        {isRegister ? "Crea tu cuenta y empieza a rutear." : "Tu mapa personal de lugares favoritos."}
      </p>

      <form onSubmit={handleSubmit}>
        <input
          className="input-field"
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input-field"
          type="password"
          placeholder="Tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {isRegister && (
          <div className="privacy-container">
            <input
              type="checkbox"
              id="privacy"
              checked={acceptedPrivacy}
              onChange={(e) => setAcceptedPrivacy(e.target.checked)}
            />
            <label htmlFor="privacy">
              Acepto la política de privacidad (Ley de Protección de Datos Personales Argentina).
            </label>
          </div>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={isRegister && !acceptedPrivacy}
        >
          {isRegister ? "Registrarme" : "Iniciar sesión"}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
        {isRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
        <button
          type="button"
          onClick={() => setIsRegister(!isRegister)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          {isRegister ? "Inicia sesión" : "Regístrate"}
        </button>
      </p>

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

export { Auth };
