import React, { useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import styled from 'styled-components';
import config from '../../config';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  width: 40vw;
  max-width: 1600px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const Messages = styled.div`
  max-height: 60vh;
  min-height: 60vh;
  overflow-y: auto;
  padding-right: 20px;
  padding-bottom: 20px;
`;

const StyledMessage = styled.div`
  background-color: ${(props) => (props.$isOwnMessage ? '#ccffcc' : 'grey')};
  padding: 8px;
  margin-bottom: 10px;
  border-radius: 5px;
  min-width: 100px;
  max-width: 70%;
  display: inline-block;
  clear: both;
  position: relative;
  word-break: break-word;
  overflow: hidden;
  padding-right: 40px;
  float: ${(props) => (props.$isOwnMessage ? 'right' : 'left')};
`;

const MessageContent = styled.span`
  text-align: left;
  display: block;
  position: relative;
  padding-right: 20px;
`;

const MessageTime = styled.span`
  color: #666;
  font-size: 12px;
  position: absolute;
  bottom: 5px;
  right: 10px;
`;

const ChatForm = styled.form`
  display: flex;
  margin-top: 20px;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-right: 10px;
`;

const EmojiButton = styled.button`
  padding: 10px;
  font-size: 16px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;

  &:hover {
    background-color: #0056b3;
  }
`;

const SubmitButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const EmojiPickerContainer = styled.div`
  display: ${(props) => (props.visible ? 'block' : 'none')};
  position: absolute;
  bottom: 50px;
  right: 20px;
`;

const DateDivider = styled.div`
  text-align: center;
  margin: 10px 0;
  font-size: 14px;
  color: #666;
`;


const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const socket = useRef(null);
  const messageInputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const { ownId, chatId } = useParams();
  const realOwnToken = localStorage.getItem("token");
  const users = [+ownId, +chatId];
  const usersShowing = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const lastMessageRef = useRef(null);
  const [chatName, setChatName] = useState("");
  const [chatMembers, setChatMembers] = useState([]);

  const loadMessages = useCallback((pageNumber) => {
    if (isLoading) return;
    setIsLoading(true);
    socket.current.emit('load messages', { users: users[0], page: pageNumber, limit: 20 });
    console.log("hola");
  }, []);

  useEffect(() => {
    socket.current = io(config.url, {
      query: { token: realOwnToken }
    });
    socket.current.emit('set users', { users });

    socket.current.on('error', (error) => {
      console.error('Error del servidor:', error.message);
      setError(error.message);
      socket.current.disconnect();
      navigate('/');
    });

    socket.current.on('chat message', (content, id, sender_user, date_sent) => {
      const message = {
        content,
        id,
        sender_user,
        date_sent,
      };
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.current.on('load messages', (info, loadedMessages, hasMoreMessages) => {
      setMessages((prevMessages) => {
        const newMessages = [...loadedMessages, ...prevMessages];
        return newMessages.filter((message, index, self) =>
          index === self.findIndex((t) => t.id === message.id)
        );
      });
      setChatName(info.chatName);
      setChatMembers(info.userList);
      setHasMore(hasMoreMessages);
      setIsLoading(false);
    });

    loadMessages(page);

    return () => {
      socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        messagesContainerRef.current &&
        messagesContainerRef.current.scrollTop === 0 &&
        hasMore &&
        !isLoading
      ) {
        const currentScrollHeight = messagesContainerRef.current.scrollHeight;
        setPage((prevPage) => prevPage + 1);
        setTimeout(() => {
          if (messagesContainerRef.current) {
            const newScrollHeight = messagesContainerRef.current.scrollHeight;
            messagesContainerRef.current.scrollTop = newScrollHeight - currentScrollHeight;
          }
        }, 100);
      }
    };

    const messagesContainer = messagesContainerRef.current;
    if (messagesContainer) {
      messagesContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (messagesContainer) {
        messagesContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [hasMore, isLoading]);

  useEffect(() => {
    if (page > 1) {
      loadMessages(page);
    }
  }, [page, loadMessages]);

  const scrollToBottom = () => {
    messagesContainerRef.current?.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    if (page === 1) {
      scrollToBottom();
    }
  }, [messages, page]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim() !== '') {
      socket.current.emit('chat message', { mensaje: input });
      setInput('');
    }
  };

  const toggleEmojiPicker = () => {
    setEmojiPickerVisible(!emojiPickerVisible);
  };

  const addEmoji = (emoji) => {
    setInput(input + emoji.native);
    setEmojiPickerVisible(false);
    messageInputRef.current.focus();
  };

  const formatDate = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
  
    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return messageDate.toLocaleDateString('es-ES', { weekday: 'long' });
    } else {
      return messageDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = formatDate(message.date_sent);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <Container>
      {chatName !== null ? (<h1>{chatName}</h1>) : (<h1>{chatMembers[1]}</h1>)}
      <Messages id="messages" ref={messagesContainerRef}>
        {Object.entries(groupedMessages).map(([date, msgs], groupIndex) => (
          <React.Fragment key={date}>
            <DateDivider>{date}</DateDivider>
            {msgs.map((msg, index) => (
              <StyledMessage
                key={msg.id}
                $isOwnMessage={msg.sender_user === +ownId}
                ref={groupIndex === 0 && index === 0 ? lastMessageRef : null}
              >
                {chatName !== null ? <span>{msg.username}</span> : null }
                <MessageContent>{msg.content}</MessageContent>
                <MessageTime>{formatTime(msg.date_sent)}</MessageTime>
              </StyledMessage>
            ))}
          </React.Fragment>
        ))}
      </Messages>

      <ChatForm id="chatForm" onSubmit={sendMessage}>
        <MessageInput
          type="text"
          id="messageInput"
          placeholder="Escribe tu mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          required
          ref={messageInputRef}
        />
        <EmojiButton type="button" id="emojiButton" onClick={toggleEmojiPicker}>
          😀
        </EmojiButton>
        <SubmitButton type="submit">Enviar</SubmitButton>
      </ChatForm>

      <EmojiPickerContainer visible={emojiPickerVisible}>
        <Picker 
          data={data}
          onEmojiSelect={addEmoji}
          style={{
            position:"absolute",
            marginTop: "465px",
            marginLeft: -40,
            maxWidth: "320px",
            borderRadius: "20px",
          }}
          theme="dark"
        />
      </EmojiPickerContainer>
    </Container>
  );
};

export default Chat;