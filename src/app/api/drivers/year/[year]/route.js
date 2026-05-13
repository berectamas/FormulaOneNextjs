import clientPromise from '../../../../lib/mongodb';

export async function GET(req, context) {
  const params = await context.params;
  const year = params.year;
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
    const calendars = await db
      .collection('Calendar')
      .find({ Year: yearNumber })
      .project({ _id: 1 })
      .toArray();
    const calendarIds = calendars.map((c) => c._id);
    const drivers = await db
      .collection('Drivers')
      .aggregate([
        {
          $lookup: {
            from: 'DriverYears',
            localField: '_id',
            foreignField: 'DriverId',
            as: 'Years',
          },
        },
        {
          $match: {
            'Years.Year': yearNumber,
          },
        },

        {
          $lookup: {
            from: 'RaceInformations',
            localField: '_id',
            foreignField: 'DriverId',
            as: 'RaceInformations',
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ['$RaceEvent', [0, 4]],
                  },
                },
              },

              // Calendar
              {
                $lookup: {
                  from: 'Calendars',
                  localField: 'CalendarId',
                  foreignField: '_id',
                  as: 'Calendar',
                },
              },
              { $unwind: '$Calendar' },

              {
                $match: {
                  $expr: {
                    $eq: ['$Calendar.Year', yearNumber],
                  },
                },
              },

              // TEAM -> Teams tábla
              // TEAM + TeamByYear beágyazva
              {
                $lookup: {
                  from: 'Teams',
                  localField: 'TeamId',
                  foreignField: '_id',
                  as: 'Team',
                  pipeline: [
                    {
                      $lookup: {
                        from: 'TeamByYear',
                        let: { teamId: '$_id' },
                        pipeline: [
                          {
                            $match: {
                              $expr: {
                                $and: [
                                  { $eq: ['$TeamId', '$$teamId'] },
                                  { $eq: ['$Year', yearNumber] },
                                ],
                              },
                            },
                          },
                        ],
                        as: 'TeamByYear',
                      },
                    },

                    {
                      $unwind: {
                        path: '$TeamByYear',
                        preserveNullAndEmptyArrays: true,
                      },
                    },
                  ],
                },
              },
              { $unwind: '$Team' },

              // opcionális: ha 1 rekord kell
              {
                $unwind: {
                  path: '$TeamByYear',
                  preserveNullAndEmptyArrays: true,
                },
              },

              // legfrissebb race
              {
                $sort: {
                  'Calendar.Date': -1,
                },
              },
              {
                $limit: 1,
              },
            ],
          },
        },

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
