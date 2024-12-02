import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../config";
import "./InicioSesion.css";
import { Link } from "react-router-dom";
import Button from "../Button/Button.jsx";

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

        localStorage.setItem("token",response.data.token);
        
        closePopup()
        window.location.reload(); 
      } else {
        window.alert("Error al iniciar sesión");
      }
    } catch (e) {
      console.error("Error al iniciar sesión:", e);
      window.alert("Error al iniciar sesión");
    }
  };

  const isFormValid = () => {
    const isPasswordValid = password.length >= 8;
    const isAllFieldsFilled = username && password && firstName && lastName && email && dateOfBirth;
    const isAgeValid = new Date().getFullYear() - new Date(dateOfBirth).getFullYear() >= 13;
    return isPasswordValid && isAllFieldsFilled && isAgeValid;
  };

  const loadLogInInputs = () => {
    setShowLoginInputs(true);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(config.url + "user/register", {
        username,
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        date_of_birth: dateOfBirth,
        description: "",
        profile_photo: "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg",
        role_id: 0,
      });

      if (response.data.success) {
        handleLogin(e); // Llamada a handleLogin después del registro exitoso
      } else {
        window.alert(response.data.message || "Registro fallido");
      }
    } catch (e) {
      if (e.response) {
        const errorMessage = e.response.data.message || "Error en los campos del registro.";
        window.alert(errorMessage);
      } else {
        console.error("Error desconocido:", e);
      }
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    closeModal();
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
                  {password && password.length < 8 && (
                    <p className="error passwordError">La contraseña debe tener al menos 8 caracteres.</p>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="date_of_birth">Fecha de nacimiento</label>
                  <input
                    type="date"
                    id="date_of_birth"
                    value={dateOfBirth}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 13))
                      .toISOString()
                      .split("T")[0]} // Fecha máxima para cumplir la restricción de 13 años
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="inicio-sesion-btn inicio-sesion-btn-register"
                  disabled={!isFormValid()} // Botón deshabilitado si el formulario no es válido
                >
                  Registrarse
                </Button>
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
              <Link to="/informacion/terminos">Términos de uso</Link> y confirmas que has leído la{" "}
              <Link to="/informacion/privacidad" onClick={closeModal}>Política de privacidad</Link>
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
