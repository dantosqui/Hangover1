import "./carta.css";
import { Link } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../AuthContext.js";
import { guardarHandler, eliminarGuardadoHandler } from "../../universalhandlers.js";
import standardUser from "../../vendor/imgs/standardUser.png"; // Import the default image
import axios from "axios";
import config from '../../config.js';

function Carta({ profile_photo, username, user_id, cloth, post_id, onClickFunction , putLike, removeWhenUnsaved}) {
  const { isLoggedIn, openModalNavBar } = useContext(AuthContext);
  const [saved, setSaved] = useState(false);

  const verificarGuardado = async () => {
    if(isLoggedIn){
      try {
        const token = localStorage.getItem('token');
  
        // Hacer solicitud al backend para verificar si el diseño está guardado
        const response = await axios.get(`${config.url}post/${post_id}/save`, {
          headers: { Authorization: `Bearer ${token}` }// Cambia "postId" por lo que necesites.
        });
        
        setSaved(response.data); // Asumiendo que el backend devuelve { isSaved: true/false }
        console.log(saved)
      } catch (error) {
        console.error('Error verificando si está guardado:', error);
      }
    }
    
  };

  useEffect(() => {
    verificarGuardado(); // Llama a la función al montar el componente.
  }, []);

  return (
    <div className='card'>
      <div className="guardador">
        <Link className="description" to={`/user/${user_id}`} onClick={(e) => e.stopPropagation()}>
          <img className="profpic" src={profile_photo || standardUser} alt="Foto de perfil" />
          <span className="user">{username}</span>
        </Link>
        {putLike && (saved ? (
          <Link 
            className="Guardado" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              eliminarGuardadoHandler(post_id, setSaved);
              removeWhenUnsaved !== undefined ? removeWhenUnsaved : null
            }}
          >
            Guardado
          </Link>
        ) : (
          <Link 
            className="Guardar" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              guardarHandler(post_id, setSaved, isLoggedIn, openModalNavBar);
            }}
          >
            Guardar
          </Link>
        ))}
      </div>
      <div className="content" onClick={onClickFunction}>
        <img className="remerita" src={cloth} alt="Ropa" />
      </div>
    </div>
  );
}

export default Carta;