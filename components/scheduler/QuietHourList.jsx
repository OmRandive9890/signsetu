"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar, Clock, Edit, Trash2, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { format, isToday, isTomorrow, isPast, isFuture } from 'date-fns';
import client from '@/api/client';

const QuietHourList = ({ onEdit }) => {
  const [quietHours, setQuietHours] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuietHours = async () => {
    try {
      const { data: { session } } = await client.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/quiet-hours', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuietHours(data);
      }
    } catch (error) {
      toast.error('Failed to fetch quiet hours');
    } finally {
      setLoading(false);
    }
  };

  const deleteQuietHour = async (id) => {
    try {
      const { data: { session } } = await client.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/quiet-hours/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        toast.success('Quiet hour deleted');
        fetchQuietHours();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete quiet hour');
      }
    } catch (error) {
      toast.error('Failed to delete quiet hour');
    }
  };

  const getStatusBadge = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isPast(end)) {
      return <Badge variant="secondary">Completed</Badge>;
    } else if (isPast(start) && isFuture(end)) {
      return <Badge variant="default" className="bg-green-600">Active</Badge>;
    } else {
      return <Badge variant="outline">Upcoming</Badge>;
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    const now = new Date();
    
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  useEffect(() => {
    fetchQuietHours();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading quiet hours...</div>
        </CardContent>
      </Card>
    );
  }

  if (quietHours.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Your Quiet Hours
          </CardTitle>
          <CardDescription>No quiet hours scheduled yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Create your first quiet hour to get started with focused study sessions!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Your Quiet Hours ({quietHours.length})
        </CardTitle>
        <CardDescription>Manage your scheduled study sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {quietHours.map((quietHour) => (
            <div
              key={quietHour._id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{quietHour.title}</h3>
                    {getStatusBadge(quietHour.startTime, quietHour.endTime)}
                  </div>
                  
                  {quietHour.description && (
                    <p className="text-gray-600 mb-3">{quietHour.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDateTime(quietHour.startTime)}
                    </div>
                    <span>→</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDateTime(quietHour.endTime)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                    <Bell className="h-3 w-3" />
                    Email notification: {quietHour.emailSent ? 'Sent' : 'Pending'}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(quietHour)}
                    disabled={isPast(new Date(quietHour.startTime))}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteQuietHour(quietHour._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuietHourList;

