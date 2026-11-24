import clientPromise from '../../../../lib/mongodb';

export async function GET(req, context) {
  try {
    const params = await context.params;
    const year = params.year;
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
        {
          $sort: { Name: 1 },
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
/*export async function GET(req, context) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const params = await context.params;
  const year = params.year;
  try {
    const res = await fetch(`https://formulaoneproject.vercel.app/api/teams/year/${year}`);
    const data = await res.json();

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}*/
