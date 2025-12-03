import React, { createContext, useState, useEffect, Children } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({Children}) =>{
    const [islogin, setlogin] = useState(false);
    const [user, setuser] = useState(null);
    const [userName, setuserName] = useState(null);

    useEffect(() =>{
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        const user_name = localStorage.getItem('userName');
        if(token){
            setlogin(true);
            setuser(user);
            setuserName(user_name);
        }
    },[]);

    return <Auth.conetex.Provider value = {value}>{childer}</Auth.conetex.Provider>
};

export default AuthContext;