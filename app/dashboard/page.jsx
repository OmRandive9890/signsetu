"use client";
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { Bell, BookOpen, Calendar } from 'lucide-react'
import client from '@/api/client'
import QuietHourForm from '@/components/scheduler/QuietHourForm'
import QuietHourList from '@/components/scheduler/QuietHourList'

const Dashboard = () => {
    const [showForm, setShowForm] = useState(false)
    const [editingQuietHour, setEditingQuietHour] = useState(null)

    const handleFormSuccess = () => {
        setShowForm(false)
        setEditingQuietHour(null)
    }

    const handleEdit = (quietHour) => {
        setEditingQuietHour(quietHour)
        setShowForm(true)
    }

    const handleCancelEdit = () => {
        setEditingQuietHour(null)
        setShowForm(false)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <BookOpen className="h-8 w-8 text-blue-600" />
                                Quiet Hours Scheduler
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Schedule focused study sessions and get email reminders
                            </p>
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={() => client.auth.signOut()}
                            className="flex items-center gap-2"
                        >
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    {showForm ? (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">
                                    {editingQuietHour ? 'Edit Quiet Hour' : 'Create New Quiet Hour'}
                                </h2>
                                <Button 
                                    variant="outline" 
                                    onClick={handleCancelEdit}
                                >
                                    Cancel
                                </Button>
                            </div>
                            <QuietHourForm 
                                onSuccess={handleFormSuccess}
                                editingQuietHour={editingQuietHour}
                            />
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Your Quiet Hours</h2>
                                <Button 
                                    onClick={() => setShowForm(true)}
                                    className="flex items-center gap-2"
                                >
                                    <Calendar className="h-4 w-4" />
                                    Schedule New
                                </Button>
                            </div>
                            <QuietHourList onEdit={handleEdit} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
