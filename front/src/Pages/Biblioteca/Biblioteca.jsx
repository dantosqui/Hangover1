// LibraryPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Biblioteca.css'; 
import axios from 'axios';
import config from '../../config.js';
import Carta from '../../components/Carta/carta.jsx';
import CartaSimple from '../../components/CartaSimple/cartaSimple.jsx';
import { Link } from 'react-router-dom';
import likedIcon from '../../vendor/imgs/heart.svg'
import savedIcon from '../../vendor/imgs/bookmark.svg'
import designIcon from '../../vendor/imgs/designicon.png'
import { AuthContext } from '../../AuthContext.js';
import Button from '../../components/Button/Button.jsx';

const LibraryPage = () => {
  const [items, setItems] = useState({ saved: [], liked: [], borradores: [] });
  const [activeTab, setActiveTab] = useState('liked');
  const [activeFilter, setActiveFilter] = useState('liked'); 
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [publishedDesigns, setPublishedDesigns] = useState(new Set());
  const navigate = useNavigate();
  const { strictCheckAuth, fetchUserInfo } = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState(null);
  const [totalDesigns,setTotalDesigns] = useState([]);

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        // Obtener información del usuario
        const userInfoData = await fetchUserInfo();
        if (!userInfoData) {
          throw new Error('No se pudo obtener la información del usuario');
        }
        setUserInfo(userInfoData);

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay token disponible');
        }

        // Obtener items de la biblioteca
        const libraryResponse = await axios.get(config.url + 'user/library', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Obtener posts publicados
        const postsResponse = await axios.get(`${config.url}post`, {
          params: { limit: 100, page: 1 },
          headers: { Authorization: `Bearer ${token}` }
        } );

        // Crear Set de IDs de diseños publicados
        let publishedIds = new Set();
        if (postsResponse.data && Array.isArray(postsResponse.data.collection)) {
          
          
          setTotalDesigns(postsResponse.data.collection)
          // Extraer los IDs directamente de la collection
          publishedIds = new Set(
            postsResponse.data.collection.map((post, index) => index + 1)
          );
        
          
         
        }
        setPublishedDesigns(publishedIds);

        // Procesar la respuesta de la biblioteca
        if (libraryResponse.data && typeof libraryResponse.data === 'object') {
          const { saved, liked, borradores } = libraryResponse.data;
          if (Array.isArray(saved) && Array.isArray(liked) && Array.isArray(borradores)) {
            const draftItemsWithBlobUrls = await processBlobs(borradores);
            console.log("BORRADORS", libraryResponse.data)
            setItems({
              saved,
              liked,
              borradores: draftItemsWithBlobUrls
            });
          } else {
            throw new Error("API response format is incorrect");
          }
        } else {
          throw new Error("Invalid API response");
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error.message || "Error fetching data");
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [fetchUserInfo]);

  const processBlobs = async (items) => {
    try {
      return Promise.all(items.map(async (item) => {
        
        const blobResponse = await fetch(item.image);
        const blob = await blobResponse.blob();
        const url = URL.createObjectURL(blob);
        return { ...item, image: url };
      }));
    } catch (error) {
      console.error('Error processing blobs:', error);
      return items;
    }
  };

  const setItemsGuardados = () => {
    setActiveTab('saved');
    setActiveFilter('saved');
  };

  const setItemsLikeados = () => {
    setActiveTab('liked');
    setActiveFilter('liked');
  };

  const setItemsBorradores = () => {
    setActiveTab('borradores');
    setActiveFilter('borradores');
  };

  const handleViewDesign = (postId) => {
    navigate(`/post/${postId}`);
  };

  if (isLoading) {
    return <div className="loading-container">Cargando...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const displayedItems = Array.isArray(items[activeTab]) ? items[activeTab] : [];

  return (
    <div className="fondo">
      <div className="library-container">
        <div className='contaiAyCasiEhTePensasteQueLoIbaADecirFzJajajajajaNadaMeDetendra'>
          <div className="filtros">
            <h2 className='libraryTitle'>Mi biblioteca</h2>
            <div className='filtericons'>
              <div 
                onClick={setItemsBorradores} 
                className={`filter-container ${activeFilter === 'borradores' ? 'active' : ''}`}
              >
                <img className="iconLibrary" src={designIcon} alt="Borradores" />
              </div>
              <div 
                onClick={setItemsGuardados} 
                className={`filter-container ${activeFilter === 'saved' ? 'active' : ''}`}
              >
                <img className="iconLibrary" src={savedIcon} alt="Guardados" />
              </div>
              <div 
                onClick={setItemsLikeados} 
                className={`filter-container ${activeFilter === 'liked' ? 'active' : ''}`}
              >
                <img className="iconLibrary" src={likedIcon} alt="Me gusta" />
              </div>
            </div>
          </div>
        </div>
        <div className="cuadrado">
          <div className="library-grid" key={activeTab}>
            {displayedItems.length === 0 ? (
              <div className="empty-state-message">
                {activeFilter === 'borradores' && (
                  <p>No tienes borradores guardados todavía.</p>
                )}
                {activeFilter === 'saved' && (
                  <p>No tienes diseños guardados todavía.</p>
                )}
                {activeFilter === 'liked' && (
                  <p>No tienes diseños que te gusten todavía.</p>
                )}
              </div>
            ) : activeFilter !== 'borradores' ? (
              displayedItems.map((item, index) => ( //displayedItems trae el item mal??????
                <div 
                  key={`${activeTab}-${item.postid}-${index}`} 
                  className="library-item" 
                  onClick={() => handleViewDesign(item.postid)}
                >
                  
                  <Carta 
                    post_id={item.postid} 
                    cloth={item.front_image} 
                    profile_photo={item.profile_photo}
                    username={item.username}    
                    user_id={item.creator_id}
                    onClickFunction={() => handleViewDesign(item.postid)}
                    putLike={false}
                  />
                </div>
              ))
            ) : (
              displayedItems.map((item, index) => (
                <div className="designItemWrapper" key={`${item.image}-${index}`}>
                  <Link to="/designer" state={{ designId: item.id }}>
                    
                    <CartaSimple 
                      cloth={item.image} 
                      profile_photo={userInfo[0]?.profile_photo || '/ruta/a/tu/imagen/default.png'}
                      isPublished={publishedDesigns.has(item.id)}
                      design_id={item.id}
                    />
                  </Link>
                 
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;