import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import QuietHour from '@/models/QuietHour';
import client from '@/api/client';

// DELETE - Delete a quiet hour
export async function DELETE(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error } = await client.auth.getUser(token);
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const quietHour = await QuietHour.findOneAndDelete({
      _id: params.id,
      userId: user.id
    });

    if (!quietHour) {
      return NextResponse.json({ error: 'Quiet hour not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Quiet hour deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiet hour:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update a quiet hour
export async function PUT(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error } = await client.auth.getUser(token);
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, startTime, endTime, description } = await request.json();

    if (!title || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
    }

    await connectDB();

    // Check for overlapping quiet hours (excluding current one)
    const overlapping = await QuietHour.findOne({
      userId: user.id,
      isActive: true,
      _id: { $ne: params.id },
      $or: [
        {
          startTime: { $lt: end },
          endTime: { $gt: start }
        }
      ]
    });

    if (overlapping) {
      return NextResponse.json({ 
        error: 'You already have a quiet hour scheduled during this time' 
      }, { status: 409 });
    }

    const quietHour = await QuietHour.findOneAndUpdate(
      { _id: params.id, userId: user.id },
      {
        title,
        startTime: start,
        endTime: end,
        description: description || '',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!quietHour) {
      return NextResponse.json({ error: 'Quiet hour not found' }, { status: 404 });
    }

    return NextResponse.json(quietHour);
  } catch (error) {
    console.error('Error updating quiet hour:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

