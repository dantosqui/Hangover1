import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Button from "../../components/Button/Button.jsx";
import config from "../../config.js";
import { AuthContext } from "../../AuthContext.js";
import "./Profile.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { guardarHandler, eliminarGuardadoHandler, followHandler, unFollowHandler } from "../../universalhandlers.js";
import Carta from "../../components/Carta/carta.jsx";

const Profile = () => {
  const { userId } = useParams();
  const [ownUserId, setOwnUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const { isLoggedIn, openModalNavBar, strictCheckAuth, setIsLoggedIn } = useContext(AuthContext); 
  const [follows, setFollows] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    description: "",
    profile_photo: "",
  });

  useEffect(() => {
    const checkauth = async () => {
      return strictCheckAuth(navigate);
    };
    checkauth();
  }, []);

  const LogOut = () => {
    localStorage.setItem('token', '');
    setIsLoggedIn(false);
    window.location.reload();
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token2 = localStorage.getItem("token");
        if (isLoggedIn) {
          const checkisloggedinuser = await axios.get(`${config.url}user/`, {
            headers: { Authorization: `Bearer ${token2}` },
          });
          
          setIsOwnProfile(checkisloggedinuser.data[0].id == userId);

          if (checkisloggedinuser.data[0].id !== null) {
            setOwnUserId(checkisloggedinuser.data[0].id);
          }
        }

        const response = await axios.get(`${config.url}user/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token2}` },
        });
        setUserData(response.data);
        setFollows(response.data.follows);

        setFormData({
          first_name: response.data.user_data.first_name,
          last_name: response.data.user_data.last_name,
          username: response.data.user_data.username,
          description: response.data.user_data.description,
          profile_photo: response.data.user_data.profile_photo
        });
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      let updatedProfilePhoto = formData.profile_photo;
  
      if (previewImage) {
        setUploadingImage(true);
  
        const imageFormData = new FormData();
        const fileInput = document.getElementById('profile-image-input');
        const file = fileInput.files[0];
        imageFormData.append('image', file, file.name);
  
        const response = await axios.post(
          `${config.url}vendor/upload`,
          imageFormData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
  
        // Update to use backend port and correct image path
        updatedProfilePhoto = `http://localhost:3508/images/${response.data.filename}`;
        setUploadingImage(false);
      }
  
      const dataToSend = {
        ...formData,
        profile_photo: updatedProfilePhoto || userData.user_data.profile_photo,
      };
  
      await axios.put(
        `${config.url}user/profile/simple/${userId}`,
        dataToSend,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      setUserData((prevData) => ({
        ...prevData,
        user_data: {
          ...prevData.user_data,
          ...dataToSend,
        },
      }));
  
      setFormData(dataToSend);
      setEditing(false);
      setPreviewImage(null);
    } catch (error) {
      console.error("Error saving user data", error);
      alert("Error al guardar los cambios. Por favor, intenta de nuevo.");
      setUploadingImage(false);
    }
  };

  const loadChat = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${config.url}chat/get/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      navigate(`/chatsview/?openId=${response.data}`);
    } catch (error) {
      console.error(error);
    }
  };

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-headers">
        <div className="profile-picture-and-name profile-backgorund">
          <div className="picture">
            <img
              src={userData.user_data.profile_photo}
              alt={userData.user_data.username}
              className="profile-pic"
            />
          </div>
          <div className="name">
            <h1>{userData.user_data.first_name}</h1>
            <p>@{userData.user_data.username}</p>
          </div>
        </div>

        <div className="profile-description profile-backgorund">
          {editing ? (
            <>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="Nombre"
              />
              <input 
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Apellido"
              />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="@Usuario"
              />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descripción"
              />

              <div className="image-upload">
                <label 
                  htmlFor="profile-image-input" 
                  className="image-upload-label"
                  style={{
                    cursor: 'pointer',
                    display: 'block',
                    position: 'relative'
                  }}
                >
                  <img
                    src={previewImage || formData.profile_photo || userData.user_data.profile_photo}
                    alt="Imagen de perfil"
                    className="profile-img"
                    style={{
                      width: '150px',
                      height: '150px',
                      objectFit: 'cover'
                    }}
                  />
                  <div 
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      opacity: 0,
                      transition: 'opacity 0.3s',
                      ':hover': {
                        opacity: 1
                      }
                    }}
                  >
                    {uploadingImage ? 'Subiendo...' : 'Cambiar imagen'}
                  </div>
                </label>
                <input
                  type="file"
                  id="profile-image-input"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  disabled={uploadingImage}
                />
              </div>
              <Button text="Guardar" onClick={handleSave} disabled={uploadingImage} />
              <Button text="Cancelar" onClick={() => {
                setEditing(false);
                setPreviewImage(null);
              }} />
            </>
          ) : (
            <div className="desc">
              <p>{userData.user_data.description}</p>
            </div>
          )}
          <div className="profile-actions">
            {isOwnProfile ? (
              <>
                <Button text="Editar Perfil" onClick={() => setEditing(true)} />
                <Button text="Configuración" />
                <Button text="Cerrar sesión" onClick={() => LogOut()}/>
              </>
            ) : (
              <>
                {follows ? (
                  <Button
                    onClick={() => unFollowHandler(userId, setFollows, setUserData)}
                    text="Dejar de seguir"
                  />
                ) : (
                  <Button
                    text="Seguir"
                    onClick={() =>
                      followHandler(userId, setFollows, isLoggedIn, openModalNavBar, setUserData)
                    }
                  />
                )}
                <Button onClick={async (e) => {
                  if (!isLoggedIn) {
                    e.preventDefault();
                    openModalNavBar();
                  } else {
                    await loadChat();
                  }
                }} text="Mensaje"/>
                <Button text="Dar Insignia" />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="profile-stats profile-backgorund">
        <span>{userData.user_data.post_number} Prendas</span>
        <span>{userData.user_data.follower_number} Seguidores</span>
        <span>{userData.user_data.followed_number} Seguidos</span>
      </div>

      <section className="profile-content">
        <div className="columns">
          {userData.posts !== null
            ? userData.posts.map((item) => (
              <Link
                to={`/post/${item.id}`}
                key={item.id}
              >
                <Carta
                  post_id={item.id}
                  cloth={item.image}
                  profile_photo={userData.user_data.profile_photo}
                  username={userData.user_data.username}
                  user_id={userData.user_data.id}
                  putLike={true}
                  className="profile-post"
                />
              </Link>
            ))
          : null}
        </div>
      </section>
    </div>
  );
};

export default Profile;