"use client";
import useAuth from '@/hooks/useAuth'
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

const PrivatePagesLayout = ({children}) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/");
        }
    }, [user, loading])

    if (loading || !user) return null;

    return (
        <div>
            Layout
            {children}
        </div>
    )
}

export default PrivatePagesLayout
