import clientPromise from '../../../../lib/mongodb';

export async function GET(req, { params }) {
  try {
    const { year } = params;
    const client = await clientPromise;
    const db = client.db('FormulaOne');
    const yearNumber = parseInt(year, 10);
    if (isNaN(yearNumber)) {
      return new Response(JSON.stringify({ error: 'Invalid year parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const teams = await db
      .collection('Teams')
      .aggregate([
        // DriverYears csatlakoztatása
        {
          $lookup: {
            from: 'TeamByYear',
            localField: '_id',
            foreignField: 'TeamId',
            as: 'Years',
          },
        },
        // csak azok, ahol van yearNumber
        {
          $match: {
            'Years.Year': yearNumber,
          },
        },
      ])
      .toArray();
    if (!teams || teams.length === 0) {
      return new Response(JSON.stringify({ error: 'No teams found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(teams), {
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
