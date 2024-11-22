import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../config";
import "./InicioSesion.css";


const InicioSesion = ({ closeModal }) => {
  const [showPopup, setShowPopup] = useState(true);
  const [showLoginInputs, setShowLoginInputs] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(config.url + "user/login/", {
        username,
        password,
      });
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        closePopup();
        window.location.reload();
      } else {
        // Handle error
      }
    } catch (e) {
      if (e.response && e.response.status === 404) {
        window.confirm(
          "Error, inicio de sesión fallido, no existe el usuario o la contraseña es incorrecta"
        );
      } else {
        console.error(e);
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(config.url + "user/register", {
        username: username,
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        date_of_birth: dateOfBirth,
        description: "",
        profile_photo: "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg",
        role_id: 0
      });
      
      if (response.data.success) {
        
        //localStorage.setItem("token", response.data.token);
        handleLogin(e)
        //closePopup();
        //window.location.reload();
      } else {
        window.confirm(response.data.message || "Registro fallido");
      }

    } catch (e) {
      if (e.response && e.response.status === 400) {
        const errorMessage = e.response.data.mensaje /*|| "Error en los campos del registro."*/;
        window.confirm(errorMessage);
      } else {
        console.error(e);
      }
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    closeModal();
  };

  const loadLogInInputs = () => {
    setShowLoginInputs(true);
  };

  const toggleRegistering = () => {
    setIsRegistering(true);
  };

  return (
    <>
      {showPopup && (
        <div className="inicio-sesion-popup-overlay">
          <div className="inicio-sesion-popup-content">
            <button className="inicio-sesion-close-btn" onClick={closePopup}>
              &times;
            </button>

            {isRegistering ? (
              <form onSubmit={handleRegister}>
                <div className="inicioHeader">Registrarse</div>
                <div className="form-group">
                  <label htmlFor="username">Nombre de usuario</label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="first_name">Nombre</label>
                  <input
                    type="text"
                    id="first_name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="last_name">Apellido</label>
                  <input
                    type="text"
                    id="last_name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Correo electrónico</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Contraseña</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="date_of_birth">Fecha de nacimiento</label>
                  <input
                    type="date"
                    id="date_of_birth"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="inicio-sesion-btn inicio-sesion-btn-register"
                >
                  Registrarse
                </button>
              </form>
            ) : showLoginInputs ? (
              <form onSubmit={handleLogin}>
                <div className="inicioHeader">Iniciar sesión</div>
                <div className="form-group">
                  <label htmlFor="username">
                    Correo electrónico o nombre de usuario
                  </label>
                  <input
                    type="text"
                    id="username"
                    placeholder="example@ie.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Contraseña</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <a href="#" className="inicio-sesion-forgot-password">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <button
                  type="submit"
                  className="inicio-sesion-btn inicio-sesion-btn-login"
                >
                  Iniciar sesión
                </button>
              </form>
            ) : (
              <>
                <div className="inicioHeader">Iniciar sesión</div>
                <button
                  className="inicio-sesion-btn inicio-sesion-btn-email"
                  onClick={loadLogInInputs}
                >
                  <span className="inicio-sesion-icon">@</span> Usar correo
                  electrónico
                </button>
                <button className="inicio-sesion-btn inicio-sesion-btn-google">
                  <span className="inicio-sesion-icon">G</span> Continuar con
                  Google
                </button>
                <button
                  className="inicio-sesion-btn inicio-sesion-btn-guest"
                  onClick={closePopup}
                >
                  Continuar como Invitado
                </button>
              </>
            )}
            <p className="inicio-sesion-terms">
              Al seguir usando una cuenta en <b>Argentina</b> aceptas los{" "}
              <a href="#">Términos de uso</a> y confirmas que has leído la{" "}
              <a href="#">Política de privacidad</a>
            </p>
            <hr className="inicio-sesion-divider" />
            {!isRegistering && (
              <p className="inicio-sesion-register">
                ¿No tienes una cuenta?{" "}
                <a href="#" onClick={toggleRegistering}>
                  Regístrate
                </a>
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default InicioSesion;
