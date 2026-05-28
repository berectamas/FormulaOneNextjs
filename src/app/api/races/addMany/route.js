import { ObjectId } from 'mongodb';
import clientPromise from '@/app/lib/mongodb';

export async function POST(request) {
  try {
    const body = await request.json();

    if (!Array.isArray(body)) {
      return new Response(JSON.stringify({ success: false, error: 'Expected array' }), {
        status: 400,
      });
    }

    const client = await clientPromise;
    const db = client.db('FormulaOne');

    const mapped = body.map((item) => ({
      CalendarId: new ObjectId(item.CalendarId),
      DriverId: new ObjectId(item.DriverId),
      TeamId: new ObjectId(item.TeamId),
      RaceEvent: item.RaceEvent,
      Position: item.Position,
      IsFastestLapOnTheRace: item.IsFastestLapOnTheRace ?? false,
      Hours: item.Hours,
      Miliseconds: item.Miliseconds,
      Minutes: item.Minutes,
      Seconds: item.Seconds,
      LapsCompleted: item.LapsCompleted,
      FinishingStatus: item.FinishingStatus,
      GridPosition: item.GridPosition,
    }));

    const result = await db.collection('RaceInformations').insertMany(mapped);

    return new Response(
      JSON.stringify({
        success: true,
        insertedCount: result.insertedCount,
        ids: result.insertedIds,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
