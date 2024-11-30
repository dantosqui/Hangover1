import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import "./components/FilterButton.css";
import Navbar from "./components/NavBar/navbar.jsx";
import Explorar from "./Pages/Explorar/Explorar.jsx";
import PostDetail from "./Pages/PostDetail/postDetail.jsx"; 
import InicioSesion from "./components/InicioSesion/InicioSesion.jsx";
import Biblioteca from "./Pages/Biblioteca/Biblioteca.jsx"; 
import Informacion from "./Pages/Informacion/Informacion.jsx"; 
import Profile from "./Pages/Profile/Profile.jsx"; 
import Bolsa from "./Pages/Bolsa/Bolsa.jsx"; 
import Designer from "./Pages/Designer/designer.jsx"; 
import Search from "./Pages/Search/Search.jsx"; 
import Chat from "./Pages/Chat/Chat.jsx"; 
import NewPost from "./Pages/NewPost/NewPost.jsx"; 
import Carrito from "./Pages/Carrito/Carrito.jsx"; 
import ChatsView from "./Pages/ChatsView/ChatsView.jsx";

import { AuthProvider } from "./AuthContext";

// Componente que actualiza el título de la página basado en la ruta
const ChangeTitle = () => {
  const location = useLocation();

  useEffect(() => {
    // Cambiar el título basado en la ruta
    if (location.pathname === "/") {
      document.title = "Explorar";
    } else if (location.pathname === "/login") {
      document.title = "Inicio de Sesión";
    } else if (location.pathname.startsWith("/post")) {
      const postId = location.pathname.split("/")[2];
      document.title = `Post ${postId}`;
    } else if (location.pathname.startsWith("/user")) {
      const userId = location.pathname.split("/")[2];
      document.title = `Perfil de Usuario ${userId}`;
    } else if (location.pathname === "/designer") {
      document.title = "Diseñador";
    } else if (location.pathname === "/bolsa") {
      document.title = "Carrito";
    } else if (location.pathname === "/Biblioteca") {
      document.title = "Biblioteca";
    } else if (location.pathname.startsWith("/search")) {
      const searchQuery = location.pathname.split("/")[2];
      document.title = `Buscar: ${searchQuery}`;
    } else if (location.pathname.startsWith("/privateChat")) {
      document.title = "Chat Privado";
    } else if (location.pathname.startsWith("/newPost")) {
      document.title = "New Post";
    } else if (location.pathname === "/chatsview") {
      document.title = "Chats";
    } else if (location.pathname === "/informacion") {
      document.title = "Información";
    } else {
      document.title = "Hangover";
    }
  }, [location]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <ChangeTitle /> {/* Cambia el título al navegar */}
        <Routes>
          <Route exact path="/informacion/:tema" element={<Informacion />} />
          <Route exact path="/" element={<Explorar />} />
          <Route exact path="/login" element={<InicioSesion />} />
          <Route exact path="post">
            <Route exact path=":postId" element={<PostDetail />} />
          </Route>
          <Route exact path="user">
            <Route exact path=":userId" element={<Profile />} />
          </Route>
          <Route path="/designer" element={<Designer />} />
          <Route exact path="bolsa" element={<Bolsa />} />
          <Route exact path="/biblioteca" element={<Biblioteca />} />
          <Route exact path="/search">
            <Route exact path=":search" element={<Search />} />
          </Route>
          <Route exact path="privateChat/:ownId/:chatId" element={<Chat />} />
          {/* <Route exact path="/carrito" element={<Carrito />} /> */}
          <Route exact path="/chatsview" element={<ChatsView />} />
          <Route exact path="/newPost/:designId" element={<NewPost />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
