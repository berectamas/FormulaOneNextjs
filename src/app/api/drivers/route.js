import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db('FormulaOne');

    const drivers = await db
      .collection('Drivers')
      .aggregate([
        // Country csatlakoztatása
        {
          $lookup: {
            from: 'Countries',
            localField: 'CountryId',
            foreignField: '_id',
            as: 'Country',
          },
        },
        { $unwind: { path: '$Country', preserveNullAndEmptyArrays: true } },

        // DriverYears csatlakoztatása
        {
          $lookup: {
            from: 'DriverYears',
            localField: '_id',
            foreignField: 'DriverId',
            as: 'Years',
          },
        },

        // DriverImages csatlakoztatása
        {
          $lookup: {
            from: 'DriverImages',
            localField: '_id',
            foreignField: 'DriverId',
            as: 'Images',
          },
        },

        // (Opcionális: rendezés, pl. Year szerint)
        { $sort: { 'Years.Year': 1 } },
      ])
      .toArray();

    if (!drivers || drivers.length === 0) {
      return new Response(JSON.stringify({ error: 'No drivers found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(drivers), {
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

    if (!body.FirstName?.trim() || !body.LastName?.trim() || !body.CountryId) {
      return new Response(JSON.stringify({ error: 'FirstName, LastName és CountryId kötelező' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!ObjectId.isValid(body.CountryId)) {
      return new Response(JSON.stringify({ error: 'Érvénytelen CountryId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const year = Number(body.Year);
    if (!Number.isInteger(year)) {
      return new Response(JSON.stringify({ error: 'A Year egész szám kell legyen' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let racingNumber = null;
    if (body.RacingNumber !== null && body.RacingNumber !== undefined && body.RacingNumber !== '') {
      racingNumber = Number(body.RacingNumber);
      if (!Number.isInteger(racingNumber)) {
        return new Response(JSON.stringify({ error: 'A RacingNumber egész szám kell legyen' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const client = await clientPromise;
    const db = client.db('FormulaOne');

    // 1) Driver
    const driverResult = await db.collection('Drivers').insertOne({
      FirstName: body.FirstName.trim(),
      LastName: body.LastName.trim(),
      Born: body.Born || null, // szöveg: 'YYYY-MM-DDT00:00:00'
      RaceStarts: 0,
      RaceWins: 0,
      Podiums: 0,
      CountryId: new ObjectId(body.CountryId),
      RacingNumber: racingNumber,
    });
    const driverId = driverResult.insertedId;

    // 2) DriverYears (enélkül nem jelenik meg az év listájában)
    await db.collection('DriverYears').insertOne({
      Year: year,
      DriverId: driverId,
    });

    // 3) DriverImages (csak ha van kép)
    if (body.ImageUrl) {
      await db.collection('DriverImages').insertOne({
        ImageUrl: body.ImageUrl,
        DriverId: driverId,
      });
    }

    return new Response(JSON.stringify({ _id: driverId }), {
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
