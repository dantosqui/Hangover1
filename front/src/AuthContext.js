import React, { createContext, useState, useEffect } from 'react';
import { openModal } from './components/NavBar/navbar';
import axios from 'axios';
import config from './config';


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            localStorage.setItem("token", "");
        } else if (token !== "") {
            setIsLoggedIn(true);
        }
    }, []);

    const openModalNavBar = () => {
        if (!isLoggedIn) {
            // Define openModal here or import it if it's defined elsewhere
            openModal();
        }
    };

    const strictCheckAuth = async (navigate) => {
        const token = localStorage.getItem('token');
        try{
            const trueLoggedIn = await axios.get(config.url+"user/checkToken",{
            headers:{Authorization:`bearer ${token}`}
            })
            console.log("truelogin",trueLoggedIn)
        

            return true
            
        }
        catch{
            
            navigate("/")
            return false
        }

    }

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, openModalNavBar,strictCheckAuth }}>
            {children}
        </AuthContext.Provider>
    );
};
