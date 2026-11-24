import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db('FormulaOne');

    const tracks = await db
      .collection('Tracks')
      .aggregate([
        // Csatlakoztatjuk a Country-t (ha kell)
        {
          $lookup: {
            from: 'Countries',
            localField: 'CountryId',
            foreignField: '_id',
            as: 'Country',
          },
        },
        { $unwind: { path: '$Country', preserveNullAndEmptyArrays: true } },

        // Csatlakoztatjuk a trackSpecifications-t
        {
          $lookup: {
            from: 'TrackSpecifications',
            localField: '_id',
            foreignField: 'TrackId',
            as: 'TrackSpecifications',
          },
        },

        // Minden specification-hoz csatlakoztatjuk a trackImages-t
        { $unwind: { path: '$TrackSpecifications', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'TrackImages',
            localField: 'TrackSpecifications._id',
            foreignField: 'TrackSpecificationId',
            as: 'TrackSpecifications.TrackImages',
          },
        },
        {
          $group: {
            _id: '$_id',
            Name: { $first: '$Name' },
            Description: { $first: '$Description' },
            CountryId: { $first: '$CountryId' },
            Country: { $first: '$Country' },
            TrackSpecifications: { $push: '$TrackSpecifications' },
          },
        },
      ])
      .toArray();

    if (!tracks || tracks.length === 0) {
      return new Response(JSON.stringify({ error: 'No tracks found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(tracks), {
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

    if (!body.Name || !body.CountryId) {
      return new Response(JSON.stringify({ error: 'Name és CountryId kötelező' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const client = await clientPromise;
    const db = client.db('FormulaOne');

    // 1) Track
    const trackResult = await db.collection('Tracks').insertOne({
      Name: body.Name,
      Description: body.Description || '',
      CountryId: new ObjectId(body.CountryId),
    });
    const trackId = trackResult.insertedId;

    // 2) Specification + kép (csak ha van kép)
    if (body.ImageUrl) {
      const specResult = await db.collection('TrackSpecifications').insertOne({
        TrackId: trackId,
      });

      await db.collection('TrackImages').insertOne({
        TrackSpecificationId: specResult.insertedId,
        URL: body.ImageUrl,
      });
    }

    return new Response(JSON.stringify({ _id: trackId }), {
      status: 201,
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
/*export async function GET(req) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  try {
    const res = await fetch('https://formulaoneproject.vercel.app/api/tracks');
    const data = await res.json();

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}*/
