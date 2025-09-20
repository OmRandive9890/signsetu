import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import QuietHour from '@/models/QuietHour';
import client from '@/api/client';

// GET - Fetch user's quiet hours
export async function GET(request) {
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
    const quietHours = await QuietHour.find({ 
      userId: user.id, 
      isActive: true 
    }).sort({ startTime: 1 });

    return NextResponse.json(quietHours);
  } catch (error) {
    console.error('Error fetching quiet hours:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new quiet hour
export async function POST(request) {
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

    if (start < new Date()) {
      return NextResponse.json({ error: 'Cannot schedule quiet hours in the past' }, { status: 400 });
    }

    await connectDB();

    // Check for overlapping quiet hours
    const overlapping = await QuietHour.findOne({
      userId: user.id,
      isActive: true,
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

    const quietHour = new QuietHour({
      userId: user.id,
      title,
      startTime: start,
      endTime: end,
      description: description || ''
    });

    await quietHour.save();

    return NextResponse.json(quietHour, { status: 201 });
  } catch (error) {
    console.error('Error creating quiet hour:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

