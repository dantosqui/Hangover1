import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Biblioteca.css'; 
import axios from 'axios';
import config from '../../config.js';
import Carta from '../../components/Carta/carta.jsx';
import { Link } from 'react-router-dom';
import likedIcon from '../../vendor/imgs/heart.svg'
import savedIcon from '../../vendor/imgs/bookmark.svg'
import designIcon from '../../vendor/imgs/designicon.png'
import { AuthContext } from '../../AuthContext.js';
import Button from '../../components/Button/Button.jsx';

const LibraryPage = () => {
  const [items, setItems] = useState({ saved: [], liked: [] });
  const [activeTab, setActiveTab] = useState('liked');
  const [activeFilter, setActiveFilter] = useState('liked'); 
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const {strictCheckAuth} = useContext(AuthContext)
  

  useEffect(() => {
    //let authcheck;const checkauth = async () => {return strictCheckAuth(navigate)};checkauth()
    
    //if (authcheck) { //do everything else
    
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(config.url + 'user/library', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("api data ", response);

        if (response.data && typeof response.data === 'object') {
          const { saved, liked, borradores } = response.data;
          if (Array.isArray(response.data.saved) && Array.isArray(response.data.liked) && Array.isArray(response.data.borradores)) {
            const draftItemsWithBlobUrls = await processBlobs(borradores);
            response.data.borradores = draftItemsWithBlobUrls;
            setItems(response.data);
          } else {
            setError("API response format is incorrect");
            console.error("Incorrect data format:", response.data);
          }
        } else {
          setError("Invalid API response");
          console.error("Invalid response:", response.data);
        }
      } catch (error) {
        setError("Error fetching items");
        console.error('Error fetching items', error);
      }
    };
    fetchItems();
    }
  //}
  , []);

  const processBlobs = async (items) => {
    return Promise.all(items.map(async (item) => {
      const blobResponse = await fetch(item.image);  // Asumiendo que `front_image` es una URL de Blob
      const blob = await blobResponse.blob();
      const url = URL.createObjectURL(blob);
      return { ...item, image: url };
    }));
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

 

  // Validar que `displayedItems` sea un array antes de mapear
  const displayedItems = Array.isArray(items[activeTab]) ? items[activeTab] : [];

  if (error) {
    return <div className="error-message">{error}</div>;
  }
  console.log(displayedItems)
  return (
    <div className="fondo">
      <div className="library-container">
        <div className='contaiAyCasiEhTePensasteQueLoIbaADecirFzJajajajajaNadaMeDetendra'>
          <div className="filtros">
            <h2 className='libraryTitle'>Mi biblioteca</h2>
            <div className='filtericons'>
              <div onClick={setItemsBorradores} className={`filter-container ${activeFilter === 'borradores' ? 'active' : ''}`}>
                  
                  <img className="iconLibrary" src={designIcon} alt="ss" />
                
              </div>
              <div onClick={setItemsGuardados} className={`filter-container ${activeFilter === 'saved' ? 'active' : ''}`}>
                
                  <img className="iconLibrary" src={savedIcon} alt="ss" />
                
              </div>
              <div onClick={setItemsLikeados} className={`filter-container ${activeFilter === 'liked' ? 'active' : ''}`}>
              
                  <img className="iconLibrary" src={likedIcon} alt="ss" />
               
              </div>
            </div>
          </div>
        </div>
        <div className="cuadrado">
  <div className="library-grid" key={activeTab}>
    {activeFilter !== 'borradores' ? (
      displayedItems.map((item, index) => (
        <div 
          key={`${activeTab}-${item.postid}-${index}`} 
          className="library-item" 
          onClick={() => handleViewDesign(item.postid)}
        >
          
          <Carta 
            className={`clickable cardGroup${index}`} 
            post_id={item.postid} 
            cloth={item.front_image} 
            profile_photo={item.profile_photo}
            username={item.username}    
            user_id={item.creator_id}
            onClickFunction={() => handleViewDesign(item.postid)}
            putLike={false} // Ajusta esto según sea necesario
          />
          
        </div>
      ))
    ) : (
      displayedItems.map((item, index) => (
        <div className="designItemWrapper">
        <Link to="/designer" state={{ designId: item.id }}>
            <div key={`${item.image}-${index}`} className="library-item">
              <img src={item.image} alt={`Draft ${index}`} />
            </div>
          </Link>
          <Link to={'/NewPost/'+item.id}>publicar</Link>
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
