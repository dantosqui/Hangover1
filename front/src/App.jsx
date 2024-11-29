import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import "./components/FilterButton.css";
import Navbar, { openModal } from "./components/NavBar/navbar.jsx";
import Explorar from "./Pages/Explorar/Explorar.jsx";
import PostDetail from "./Pages/PostDetail/postDetail.jsx"; // Import the PostDetail component
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

    

function App() {

  return (
    <AuthProvider>
        <Router>
            <Navbar />
            <Routes>
                <Route exact path ="/informacion/:tema" element={<Informacion/>}/>
                <Route exact path="/" element={<Explorar />} />
                <Route exact path="/login" element={<InicioSesion />} />
                <Route exact path="post">
                    <Route exact path=":postId" element={<PostDetail />} />
                </Route>
                <Route exact path="user">
                    <Route exact path=":userId" element={<Profile/>}/>
                </Route>
                <Route path="/designer" element={<Designer/>} />
                <Route exact path="bolsa" element={<Bolsa/>}></Route>
                <Route exact path="/biblioteca" element={<Biblioteca />} />
                <Route exact path="/search">
                     <Route exact path=":search" element={<Search/>}/> 
                </Route>
                <Route exact path="privateChat/:ownId/:chatId" element={<Chat/>}></Route>
                {/* <Route exact path="/carrito" element={<Carrito/>}></Route> */}
                <Route exact path="/chatsview" element={<ChatsView/>}></Route>
                <Route exact path="/newPost/:designId" element={<NewPost/>} />
                
            </Routes>   
        </Router>
    </AuthProvider>
);
}

export default App;
