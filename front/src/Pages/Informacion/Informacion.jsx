import React from 'react';
import { useParams } from 'react-router-dom';
import './Informacion.css';
import logo from '../../vendor/imgs/hangoverLogo2-02.png'
import { Link } from 'react-router-dom';

function Informacion() {
  const { tema } = useParams();

  const renderContent = () => {
    switch (tema) {
      case 'legal':
        return <p>Nosotros somos una empresa líder en libertad de diseño para tu indumentaria,
        pero eso no incluye responsabilidad completa en el envío de tu producto, por
        lo que nos comprometemos a que llegue en tiempo y forma con un precio bajo
        de manera eficiente. No nos vinculamos directamente con ningún servicio de 
        mensajería. Ante cualquier consulta, <Link to="/informacion/contacto" className='linkException'>contactanos</Link>.
        
        Nuestra labor es mantener informado al cliente sobre su pedido, y a su vez no
        preocupar a nuestros proveedores, quienes aportan la materia prima por mayor. 
        
        
        </p>;
      case 'contacto':
        return <p>Puedes contactarnos en cualquier momento a traves de estos medios: <ul><li>E-Mail: contacto@hangover.com</li> <li>Telefono: 54 9 11 6598-5434</li></ul></p>;
      case 'privacidad':
        return <p>No nos hacemos responsables con el uso de sus datos, ante cualquier consulta de hacia dónde se dirijan, o para pedido de su eliminacion <Link to="/informacion/contacto" className='linkException'>contactanos</Link>.</p>;
      default:
        return <p>Somos hangover. Somos una empresa de ropa para la compra y diseño de ropa online en hangover.</p>;
    }
  };

  return (
    <div className="infoContain">
      <img className="logoInfo" src={logo} alt="logo" />
      {renderContent()}


      <footer className="App-footer">
        <ul>
          <li>Av. 616 southside</li>
          <li>+54 11  6598 5434</li>
          <li>Av. 616 southside</li>
        </ul>
        <ul>
          <li>Hangover</li>
          <li>Nosotros</li>
          <li>Politica de privacidad</li>
          <li>Unite</li>
        </ul>
        <ul>
          <li>ayuda</li>
          <li>contactanos</li>
          <li>Preguntas</li>
        </ul>
        <ul>
          <li>Nuestras Redes</li>
        </ul>
        
      </footer>
    </div>
  );
}

export default Informacion;
