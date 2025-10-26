// pages/api/calendar.js
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const year = parseInt(url.searchParams.get('year')) || new Date().getFullYear();
    const client = await clientPromise;
    const db = client.db('FormulaOne');

    const calendarEvents = await db
      .collection('Calendars')
      .aggregate([
        { $match: { Year: year } },
        // Track csatlakoztatása
        {
          $lookup: {
            from: 'Tracks',
            localField: 'TrackId',
            foreignField: '_id',
            as: 'Track',
          },
        },
        { $unwind: { path: '$Track', preserveNullAndEmptyArrays: true } },

        // Country csatlakoztatása a Track-hez
        {
          $lookup: {
            from: 'Countries',
            localField: 'Track.CountryId',
            foreignField: '_id',
            as: 'Track.Country',
          },
        },
        { $unwind: { path: '$Track.Country', preserveNullAndEmptyArrays: true } },

        // TrackSpecifications csatlakoztatása
        {
          $lookup: {
            from: 'TrackSpecifications',
            localField: 'Track._id',
            foreignField: 'TrackId',
            as: 'Track.Specifications',
          },
        },

        // TrackImages csatlakoztatása minden specification-höz
        { $unwind: { path: '$Track.Specifications', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'TrackImages',
            localField: 'Track.Specifications._id',
            foreignField: 'TrackSpecificationId',
            as: 'Track.Specifications.Images',
          },
        },

        // Újraegyesítés a specifikációk tömbbe
        {
          $group: {
            _id: '$_id',
            Name: { $first: '$Name' },
            Year: { $first: '$Year' },
            Date: { $first: '$Date' },
            Round: { $first: '$Round' },
            IsSprintEvent: { $first: '$IsSprintEvent' },
            Track: { $first: '$Track' },
            Specifications: { $push: '$Track.Specifications' },
          },
        },

        // Beállítjuk a Track.Specifications mezőt
        {
          $addFields: {
            'Track.Specifications': '$Specifications',
          },
        },
        { $project: { Specifications: 0 } },

        // Rendezés dátum szerint
        { $sort: { Date: 1 } },
      ])
      .toArray();

    if (!calendarEvents || calendarEvents.length === 0) {
      return new Response(JSON.stringify({ error: 'No calendar events found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(calendarEvents), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
export async function POST(req) {
  try {
    const body = await req.json();
    console.log(body);
    // Validáció (minimum)
    if (!body.name || !body.date || !body.trackId || !body.round) {
      return new Response(JSON.stringify({ error: 'Hiányzó mező(k)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const client = await clientPromise;
    const db = client.db('FormulaOne');

    const newEvent = {
      Year: parseInt(body.year),
      TrackId: new ObjectId(body.trackId),
      Date: body.date,
      Name: body.name,
      IsSprintEvent: body.isSprintEvent || false,
      Round: parseInt(body.round),
    };

    const result = await db.collection('Calendars').insertOne(newEvent);

    return new Response(JSON.stringify({ success: true, id: result.insertedId }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('API POST error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
