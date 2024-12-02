import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './ChatsView.css';
import { useLocation } from 'react-router-dom';
import config from '../../config';
import Button from '../../components/Button/Button';
import Chat from '../Chat/Chat';
import { useContext } from 'react';
import { AuthContext } from '../../AuthContext';

const ChatView = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ownId, setOwnId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [friends, setFriends] = useState([]);
    const [friendsLoading, setFriendsLoading] = useState(false);
    const [friendsError, setFriendsError] = useState(null);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const {fetchUserInfo} = useContext(AuthContext)
    const [user,setUser] = useState({})

    const groupNameRef = useRef();
    const location = useLocation();

   

    const fetchRecentChats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${config.url}chat/get/chats`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setChats(response.data.chats);
            setLoading(false);
            setOwnId(response.data.ownId);
            console.log("chats nombres DEL FETCH: ", response.data.chats)
        } catch (err) {
            console.error('Error fetching recent chats:', err);
            setError('Error al obtener los chats recientes');
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchuser = async () => {
        const user = await fetchUserInfo()
        setUser(user)
        }
        fetchuser()
        fetchRecentChats();
        setSelectedChatId(location.search.split('=')[1]);
    }, []);

    const openModal = async () => {
        setIsModalOpen(true);
        setFriendsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${config.url}user/friends`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFriends(
                response.data.map((friend) => ({ ...friend, selected: false }))
            );
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

    const toggleFriendSelection = (friendId) => {
        setFriends((prevFriends) =>
            prevFriends.map((friend) =>
                friend.id === friendId
                    ? { ...friend, selected: !friend.selected }
                    : friend
            )
        );
    };

    const createGroup = async () => {
        const groupName = groupNameRef.current.value;
        const selectedFriends = friends.filter((friend) => friend.selected);

        if (!groupName || selectedFriends.length === 0) {
            alert('Por favor, proporciona un nombre para el grupo y selecciona al menos un amigo.');
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
    console.log("chat")
    return (
        <div className="chat-view-container">
            <div className="chats-list-contain">
                <h2 className='chatsRecientes'>Chats recientes</h2>
                <ul className="chatList">
    {chats.length === 0 ? (
        <li className="noChatsMessage">Todavía no tiene chats recientes</li>
    ) : (
        chats.map((chat) => (
            <li
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={selectedChatId === chat.id ? 'selected' : ''}
            >
                <div className="chatCard">
                    {chat.name !== null ? (
                        <strong>{chat.name}</strong>
                    ) : (
                        <strong>
                            {chat.chat_members.filter((i) => i !== user[0].username)[0]}
                        </strong>
                    )}
                    <span>Último mensaje: {new Date(chat.last_message_time).toLocaleString()}</span>
                </div>
            </li>
        ))
    )}
</ul>
                <div className="newChatButtonWrapper">
                    <Button className="newChat" onClick={openModal}>
                        +
                    </Button>
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
                        <h2>Crear chat</h2>

                        <input
                            type="text"
                            placeholder="Nombre de grupo"
                            ref={groupNameRef}
                            defaultValue="Nuevo grupo"
                        />

                        {friendsLoading ? (
                            <div>Cargando amigos...</div>
                        ) : friendsError ? (
                            <div>{friendsError}</div>
                        ) : (
                            <ul className="friends-list">
                                {friends.map((friend) => (
                                    <li
                                        key={friend.id}
                                        className={`friend ${friend.selected ? 'selected' : ''}`}
                                        onClick={() => toggleFriendSelection(friend.id)}
                                    >
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
