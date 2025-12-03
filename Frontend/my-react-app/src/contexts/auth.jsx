import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLogin, setLogin] = useState(false);
    const [user, setUser] = useState(null);
    const [userName, setUserName] = useState(null);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const verifyUserToken = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            const storedUserName = localStorage.getItem('userName');

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.post('http://127.0.0.1:5000/verify-token', { 
                    token: token 
                });

                if (response.data.verified === true) {
                    setLogin(true);
                    setUser(storedUser);
                    setUserName(storedUserName);
                } else {
                    handleLogout();
                }

            } catch (error) {
                console.log("Token verification failed (Network or 401):", error);
                handleLogout();
            } finally {
                setLoading(false);
            }
        };

        verifyUserToken();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userName');
        setLogin(false);
        setUser(null);
        setUserName(null);
    };

    const value = {
        isLogin,
        user,
        userName,
        setLogin, 
        setUser,
        setUserName,
        handleLogout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children} 
        </AuthContext.Provider>
    );
};