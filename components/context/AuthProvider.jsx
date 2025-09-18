"use client";
import { createContext, useState , useEffect } from "react";
import client from "@/api/client";

const AuthContext = createContext(null);

const AuthProvider = ({children}) =>{
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        client.auth.getSession().then(({data}) => {
            setUser(data?.session?.user || null);
            setLoading(false);
        });

        // for login later event
        const {data : Listener} = client.auth.onAuthStateChange((e, session) => {
            setUser(session?.user || null);
        });

        // undererd : stop listening to auth events
        return()=>{
            Listener.subscription.unsubscribe();
        };
    }, []);

    return(
        <AuthContext.Provider value={{user, loading}}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };