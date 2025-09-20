"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Calendar, Clock, BookOpen, Plus } from 'lucide-react';
import { toast } from 'sonner';
import client from '@/api/client';

const QuietHourForm = ({ onSuccess, editingQuietHour = null }) => {
  const [formData, setFormData] = useState({
    title: editingQuietHour?.title || '',
    description: editingQuietHour?.description || '',
    startTime: editingQuietHour ? 
      new Date(editingQuietHour.startTime).toISOString().slice(0, 16) : 
      '',
    endTime: editingQuietHour ? 
      new Date(editingQuietHour.endTime).toISOString().slice(0, 16) : 
      ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { session } } = await client.auth.getSession();
      if (!session) {
        toast.error('Please log in to create quiet hours');
        return;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString()
      };

      const url = editingQuietHour 
        ? `/api/quiet-hours/${editingQuietHour._id}`
        : '/api/quiet-hours';
      
      const method = editingQuietHour ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save quiet hour');
      }

      toast.success(editingQuietHour ? 'Quiet hour updated!' : 'Quiet hour created!');
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: ''
      });
      
      if (onSuccess) onSuccess(result);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          {editingQuietHour ? 'Edit Quiet Hour' : 'Create Quiet Hour'}
        </CardTitle>
        <CardDescription>
          {editingQuietHour ? 'Update your quiet hour details' : 'Schedule a focused study session'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Math Study Session"
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="What will you focus on?"
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Start Time
              </Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                required
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                End Time
              </Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                required
                min={formData.startTime || new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Saving...'
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                {editingQuietHour ? 'Update Quiet Hour' : 'Create Quiet Hour'}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuietHourForm;

