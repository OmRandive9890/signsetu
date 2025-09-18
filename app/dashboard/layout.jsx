"use client";
import useAuth from '@/hooks/useAuth'
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

const DashboardLayout = ({children}) => {
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
            {children}
        </div>
    )
}

export default DashboardLayout
