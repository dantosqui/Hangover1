import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './ChatsView.css';
import config from '../../config';
import Button from '../../components/Button/Button';
import Chat from '../Chat/Chat'; // Import the Chat component

const ChatView = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ownId, setOwnId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [friends, setFriends] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [friendsLoading, setFriendsLoading] = useState(false);
    const [friendsError, setFriendsError] = useState(null);
    const [selectedChatId, setSelectedChatId] = useState(null);

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

    const selectFriend = (friend) => {
        if (!selectedFriends.includes(friend)) {
            setSelectedFriends([...selectedFriends, friend]);
        }
    };

    const removeFriend = (friend) => {
        setSelectedFriends(selectedFriends.filter(f => f.id !== friend.id));
    };

    const createGroup = async () => {
        const groupName = groupNameRef.current.value;

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
                    members: selectedFriends.map((friend) => friend.id),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchRecentChats();
            
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
        <div className="chat-view-container">
            <div className="chats-list-contain">
                <h2>Chats recientes</h2>
                <ul className='chatList'>
                    {chats.map((chat) => (
                        <li 
                            key={chat.id}
                            onClick={() => setSelectedChatId(chat.id)}
                            className={selectedChatId === chat.id ? 'selected' : ''}
                        >
                            <div className='chatCard'>
                                {chat.name !== null ? (
                                    <strong>{chat.name}</strong>
                                ) : (
                                    <strong>{chat.username}</strong>
                                )}
                                <span>Último mensaje: {new Date(chat.last_message_time).toLocaleString()}</span>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className='newChatButtonWrapper'>
                <Button className="newChat" onClick={openModal}>+</Button>
                </div>
            </div>

            <div className="chat-container">
                {selectedChatId && ownId && (
                    <Chat className="chatWindow" chatId={selectedChatId} ownId={ownId} />
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Selecciona Amigos</h2>

                        <div className="selected-friends">
                            {selectedFriends.map((friend) => (
                                <div key={friend.id} onClick={() => removeFriend(friend)} className="selected-friend">
                                    {friend.username}
                                </div>
                            ))}
                        </div>

                        <div>
                            <input
                                type="text"
                                placeholder="Nombre de grupo"
                                ref={groupNameRef}
                            />
                        </div>

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