import { ObjectId } from 'mongodb';
import clientPromise from '@/app/lib/mongodb';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log(body);

    const client = await clientPromise;
    const db = client.db('FormulaOne');

    const newEvent = {
      CalendarId: new ObjectId(body.CalendarId),
      DriverId: new ObjectId(body.DriverId),
      TeamId: new ObjectId(body.TeamId),
      RaceEvent: body.RaceEvent,
      Position: body.Position,
      IsFastestLapOnTheRace: body.IsFastestLapOnTheRace,
      Hours: body.Hours,
      Miliseconds: body.Miliseconds,
      Minutes: body.Minutes,
      Seconds: body.Seconds,
      LapsCompleted: body.LapsCompleted,
      FinishingStatus: body.FinishingStatus,
      GridPosition: body.GridPosition,
    };

    const result = await db.collection('RaceInformations').insertOne(newEvent);

    return new Response(JSON.stringify({ success: true, id: result.insertedId }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
