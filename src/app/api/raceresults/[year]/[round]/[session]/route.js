export async function GET(req, context) {
  const params = await context.params;
  const year = params.year;
  const round = params.round;
  const session = parseInt(params.session);
  try {
    let url = '';
    if (session === 0) {
      url = `https://api.jolpi.ca/ergast/f1/${year}/${round}/results.json`;
      const res = await fetch(url);

      const text = await res.text();

      const data = JSON.parse(text);
      const returnData = data.MRData.RaceTable.Races[0].Results;
      return Response.json(returnData);
    }
    if (session > 0 && session < 4) {
      url = `https://api.jolpi.ca/ergast/f1/${year}/${round}/qualifying.json`;
      const res = await fetch(url);

      const text = await res.text();

      const data = JSON.parse(text);
      const returnData = data.MRData.RaceTable.Races[0].QualifyingResults;
      return Response.json(returnData);
    }
    if (session === 4) {
      url = `https://api.jolpi.ca/ergast/f1/${year}/${round}/sprint.json`;
      const res = await fetch(url);

      const text = await res.text();

      const data = JSON.parse(text);
      const returnData = data.MRData.RaceTable.Races[0].SprintResults;
      return Response.json(returnData);
    }
    return Response.json(session);
  } catch (err) {
    return Response.json(
      {
        error: 'Server crashed',
        message: err.message,
        stack: err.stack,
      },
      { status: 500 },
    );
  }
}
