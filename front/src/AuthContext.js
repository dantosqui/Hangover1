import React, { createContext, useState, useEffect, useCallback } from 'react';
import { openModal } from './components/NavBar/navbar';
import axios from 'axios';
import config from './config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [profilePhotoTrigger, setProfilePhotoTrigger] = useState(0);

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
            openModal();
        }
    };

    const strictCheckAuth = async (navigate) => {
        const token = localStorage.getItem('token');
        try {
            await axios.get(config.url+"user/checkToken", {
                headers: {Authorization: `bearer ${token}`}
            });
            return true;
        } catch {
            navigate("/");
            return false;
        }
    }

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        // Incrementar el trigger para forzar re-renderizado
        setProfilePhotoTrigger(prev => prev + 1);
    };

    const fetchUserInfo = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            return null;
        }

        try {
            const response = await axios.get(`${config.url}user/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                return response.data;
            } else {
                console.error("Failed to fetch user info");
                return null;
            }
        } catch (error) {
            console.error("Error fetching user info", error);
            return null;
        }
    };

    return (
        <AuthContext.Provider value={{ 
            isLoggedIn, 
            setIsLoggedIn, 
            openModalNavBar, 
            strictCheckAuth, 
            fetchUserInfo, 
            user, 
            updateUser,
            profilePhotoTrigger // Agregamos este trigger
        }}>
            {children}
        </AuthContext.Provider>
    );
};