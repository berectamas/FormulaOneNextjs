async function fetchJolpica(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'FormulaOneApp/1.0 (saját-email@példa.hu)',
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Jolpica hiba ${res.status}: ${text.slice(0, 200)}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Nem JSON válasz: ${text.slice(0, 200)}`);
  }
}

export async function GET(req, context) {
  const params = await context.params;
  const year = params.year;
  const round = params.round;
  const session = parseInt(params.session, 10);

  try {
    let endpoint;
    let resultKey;

    if (session === 0) {
      endpoint = 'results';
      resultKey = 'Results';
    } else if (session > 0 && session < 4) {
      endpoint = 'qualifying';
      resultKey = 'QualifyingResults';
    } else if (session === 4) {
      endpoint = 'sprint';
      resultKey = 'SprintResults';
    } else {
      return Response.json({ error: 'Ismeretlen session' }, { status: 400 });
    }

    const url = `https://api.jolpi.ca/ergast/f1/${year}/${round}/${endpoint}.json`;
    const data = await fetchJolpica(url);

    const race = data?.MRData?.RaceTable?.Races?.[0];
    if (!race) {
      return Response.json({ error: 'Nincs ilyen futam' }, { status: 404 });
    }

    return Response.json(race[resultKey] ?? []);
  } catch (err) {
    console.error('Jolpica API error:', err);
    return Response.json({ error: 'Server crashed', message: err.message }, { status: 500 });
  }
}
