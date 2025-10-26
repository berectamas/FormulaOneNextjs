import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req, { params }) {
  try {
    const { id } = params;

    // Ellenőrizzük, hogy érvényes-e az ObjectId
    if (!ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: 'Invalid ID format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const client = await clientPromise;
    const db = client.db('FormulaOne');

    // Lekérés ID alapján
    const calendarItem = await db.collection('Calendars').findOne({
      _id: new ObjectId(id),
    });

    if (!calendarItem) {
      return new Response(JSON.stringify({ error: 'Calendar item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(calendarItem), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('API GET error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
