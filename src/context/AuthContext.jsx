import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { apiService, handleApiError } from '../config/apiService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (token && savedUser) {
                setUser(JSON.parse(savedUser));
                setIsAuthenticated(true);

                // Verify token is still valid
                try {
                    await apiService.auth.getProfile();
                } catch (error) {
                    // Token is invalid, clear auth
                    logout();
                }
            }
        } catch (error) {
            console.error('Auth check error:', error);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            setIsLoading(true);
            const response = await apiService.auth.login(credentials);
            const { token, user: userData } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            setIsAuthenticated(true);

            toast.success('Login successful!');
            return { success: true };
        } catch (error) {
            handleApiError(error, 'login');
            return { success: false, error: error.response?.data?.message || 'Login failed' };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        toast.success('Logged out successfully');
    };

    const updateUserProfile = async (profileData) => {
        try {
            const response = await apiService.auth.updateProfile(profileData);
            const updatedUser = response.data.user;

            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            toast.success('Profile updated successfully');
            return { success: true };
        } catch (error) {
            handleApiError(error, 'update profile');
            return { success: false };
        }
    };

    const changePassword = async (passwordData) => {
        try {
            await apiService.auth.changePassword(passwordData);
            toast.success('Password changed successfully');
            return { success: true };
        } catch (error) {
            handleApiError(error, 'change password');
            return { success: false };
        }
    };

    const seedAdmin = async () => {
        try {
            const response = await apiService.auth.seedAdmin();
            toast.success(response.data.message);
            return { success: true, data: response.data };
        } catch (error) {
            handleApiError(error, 'seed admin user');
            return { success: false };
        }
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUserProfile,
        changePassword,
        seedAdmin,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 