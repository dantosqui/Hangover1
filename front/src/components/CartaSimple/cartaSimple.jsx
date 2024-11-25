import "./cartaSimple.css";
import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../AuthContext.js";
import { guardarHandler, eliminarGuardadoHandler } from "../../universalhandlers.js";
import standardUser from "../../vendor/imgs/standardUser.png"; // Import the default image

function CartaSimple({ className, profile_photo, username, user_id, cloth, post_id, onClickFunction, putLike , isPublished,design_id}) {
  const { isLoggedIn, openModalNavBar } = useContext(AuthContext);
  const [saved, setSaved] = useState(false);

  return (
    <div className='card'>
      <div className="guardador">
        <Link className="description" to={`/user/${user_id}`} onClick={(e) => e.stopPropagation()}>
          <span className="user">{username}</span>
        </Link>
        
      </div>
      <div className="content" onClick={onClickFunction}>
        <img className="remerita" src={cloth} alt="Ropa" />
      </div>
      {isPublished ? (
          <div className="Guardar">Publicado</div>
        ) : (
          <Link 
            to={`/NewPost/`+design_id} 
            className="Guardar"
            onClick={(e) => e.stopPropagation()}
          >
            Publicar
          </Link>
        )}
    </div>
    
  );
}

export default CartaSimple;