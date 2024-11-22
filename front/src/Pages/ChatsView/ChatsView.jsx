import React, { useEffect, useState, useRef  } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ChatsView.css';
import config from '../../config';
import Button from '../../components/Button/Button';

const ChatView = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ownId, setOwnId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [friends, setFriends] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]); // Estado para manejar los amigos seleccionados
    const [friendsLoading, setFriendsLoading] = useState(false);
    const [friendsError, setFriendsError] = useState(null);

    const groupNameRef = useRef();
    const fetchRecentChats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${config.url}chat/get/chats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChats(response.data.chats);
            setLoading(false);
            setOwnId(response.data.ownId);
        } catch (err) {
            console.error('Error fetching recent chats:', err);
            setError('Error al obtener los chats recientes');
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchRecentChats();
    }, []);

    const openModal = async () => {
        setIsModalOpen(true);
        setFriendsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${config.url}user/friends`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(response);
            setFriends(response.data);
            setFriendsLoading(false);
        } catch (err) {
            console.error('Error fetching friends:', err);
            setFriendsError('Error al obtener los amigos');
            setFriendsLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    // Función para seleccionar un amigo
    const selectFriend = (friend) => {
        if (!selectedFriends.includes(friend)) {
            setSelectedFriends([...selectedFriends, friend]);
        }
    };

    // Función para deseleccionar un amigo de la lista seleccionada
    const removeFriend = (friend) => {
        setSelectedFriends(selectedFriends.filter(f => f.id !== friend.id));
    };

    const createGroup = async () => {
        const groupName = groupNameRef.current.value; // Obtener el nombre del grupo

        if (!groupName || selectedFriends.length === 0) {
            alert("Por favor, proporciona un nombre para el grupo y selecciona al menos un amigo.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${config.url}chat/create/group`,
                {
                    name: groupName,
                    members: selectedFriends.map((friend) => friend.id), // IDs de amigos seleccionados
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchRecentChats();
            alert('¡Grupo creado con éxito!');
            closeModal();
            
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Error al crear el grupo');
        }
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="chat-view">
            <h2>Chats recientes</h2>
            <ul>
                {chats.map((chat) => (
                    <li key={chat.id}>
                        <Link to={`/privateChat/${ownId}/${chat.id}`}>
                            <div>
                                {chat.name !== null ? (
                                    <strong>{chat.name}</strong>
                                ) : (
                                    <strong>{chat.username}</strong>
                                )}
                                <span>Último mensaje: {new Date(chat.last_message_time).toLocaleString()}</span>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>

            {/* Botón para abrir el modal */}
            <Button onClick={openModal}>+</Button>

            {/* Modal que muestra la lista de amigos */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Selecciona Amigos</h2>

                        {/* Mostrar los amigos seleccionados */}
                        <div className="selected-friends">
                            {selectedFriends.map((friend) => (
                                <div key={friend.id} onClick={() => removeFriend(friend)} className="selected-friend">
                                    {friend.username}
                                </div>
                            ))}
                        </div>

                         {/* Campo de entrada para el nombre del grupo */}
                         <div>
                            <input
                                type="text"
                                placeholder="Nombre de grupo"
                                ref={groupNameRef} // Referencia al input
                            />
                        </div>

                        {/* Cargar lista de amigos */}
                        {friendsLoading ? (
                            <div>Cargando amigos...</div>
                        ) : friendsError ? (
                            <div>{friendsError}</div>
                        ) : (
                            <ul>
                                {friends.map((friend) => (
                                    <li className='friend' key={friend.id} onClick={() => selectFriend(friend)}>
                                        {friend.username}
                                    </li>
                                ))}
                            </ul>
                        )}

                        
                        <Button onClick={createGroup}>Crear</Button>
                        <Button onClick={closeModal}>Cancelar</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatView;
