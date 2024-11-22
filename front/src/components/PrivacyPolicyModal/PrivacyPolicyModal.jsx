import React, { useState } from 'react';
import './PrivacyPolicyModal.css'; // Asegúrate de crear este archivo para los estilos

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Política de Privacidad</h2>
        <p>
          Esta Política de Privacidad describe cómo recopilamos, usamos y protegemos su información personal cuando utiliza nuestra plataforma de red social para la compra y venta de ropa.
        </p>
        <h3>Recopilación de Información</h3>
        <p>
          Recopilamos información personal que usted nos proporciona al registrarse en nuestra página, incluyendo su nombre, dirección de correo electrónico, y detalles de contacto. También recopilamos información sobre sus preferencias de compra y venta.
        </p>
        <h3>Uso de la Información</h3>
        <p>
          Utilizamos su información para proporcionar y mejorar nuestros servicios, comunicarnos con usted sobre su cuenta y transacciones, y enviarle actualizaciones sobre nuestros productos y promociones.
        </p>
        <h3>Protección de la Información</h3>
        <p>
          Tomamos medidas razonables para proteger su información personal contra el acceso no autorizado y el uso indebido. Sin embargo, no podemos garantizar la seguridad absoluta de sus datos.
        </p>
        <h3>Consentimiento</h3>
        <p>
          Al registrarse en nuestra plataforma, usted acepta nuestra Política de Privacidad y consiente el tratamiento de su información personal de acuerdo con esta política.
        </p>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <h1>Registro en la Red Social</h1>
      <button onClick={handleOpenModal}>Leer Política de Privacidad</button>
      <PrivacyPolicyModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default App;
