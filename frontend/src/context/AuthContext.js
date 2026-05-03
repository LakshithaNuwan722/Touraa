import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    const res = await axios.get(`${API_URL}/api/auth/me`);
                    setUser(res.data);
                    if (res.data.role === 'admin' || res.data.email === 'admin@touraa.com') {
                        setIsAdmin(true);
                    }
                } catch (err) {
                    console.error("Auth init failed", err);
                    logout();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, [token]);

    const login = async (email, password) => {
        console.log("Attempting login for:", email);
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            console.log("Login response:", res.data);
            const { token, user } = res.data;

            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setToken(token);
            setUser(user);

            if (user.role === 'admin' || user.email === 'admin@touraa.com') {
                console.log("Admin detected!");
                setIsAdmin(true);
            }
            return user;
        } catch (err) {
            console.error("Login error details:", err.response?.data || err.message);
            throw err;
        }
    };

    const register = async (name, email, password, phone) => {
        try {
            const res = await axios.post(`${API_URL}/api/auth/register`, { name, email, password, phone });
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);
            return user;
        } catch (err) {
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAdmin(false);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, isAdmin, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
