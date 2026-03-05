import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('http://127.0.0.1:3000/user/checkAuth', {
                    credentials: 'include',
                });
                const data = await response.json();

                if (data.loggedIn) {
                    setUser({ username: data.username, foto: data.foto });
                }
            } catch (err) {
                console.error("Errore checkAuth:", err);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (username, password) => {
        const response = await fetch(`http://127.0.0.1:3000/user/login/${username}/${password}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Errore di login');
        }

        const data = await response.json();
        setUser({ username: data.username, foto: data.foto});
        return data;
    };

    /*const logout = async () => {
        await fetch('http://127.0.0.1:3000/user/logout', {
            credentials: 'include'
        });
        setUser(null);
    };*/

    const logout = async () => {
    try {
        await fetch('http://127.0.0.1:3000/user/logout', {
            credentials: 'include'
        });
    } catch (err) {
        console.error("Errore logout:", err);
    } finally {
        setUser(null);
    }
};

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
