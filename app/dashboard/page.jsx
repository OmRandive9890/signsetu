"use client";
import { Button } from '@/components/ui/button'
import React from 'react'

import client from '@/api/client'

const Dashboard = () => {
    return (
        <div>
            <h1>Hello to dashboard</h1>
            <Button onClick={()=>{
                client.auth.signOut();
            }}>
                Sign Out
            </Button>
        </div>
    )
}

export default Dashboard
