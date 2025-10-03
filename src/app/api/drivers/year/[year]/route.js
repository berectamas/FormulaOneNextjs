import clientPromise from '../../../../lib/mongodb';

export async function GET(req, { params }) {
  const { year } = params;
  try {
    const client = await clientPromise;
    const db = client.db('FormulaOne');
    const yearNumber = parseInt(year, 10);
    if (isNaN(yearNumber)) {
      return new Response(JSON.stringify({ error: 'Invalid year parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const drivers = await db
      .collection('Drivers')
      .aggregate([
        // DriverYears csatlakoztatása
        {
          $lookup: {
            from: 'DriverYears',
            localField: '_id',
            foreignField: 'DriverId',
            as: 'Years',
          },
        },
        // csak azok, ahol van yearNumber
        {
          $match: {
            'Years.Year': yearNumber,
          },
        },
        {
          $lookup: {
            from: 'DriverImages',
            localField: '_id',
            foreignField: 'DriverId',
            as: 'Images',
          },
        },
        // Years tömb eldobása a végén
        {
          $project: {
            Years: 0,
          },
        },
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
