import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db('FormulaOne');

    // Ha _id kellene szűréshez:
    // const objectId = new ObjectId(_id);
    // const countries = await db.collection("Countries").find({ _id: objectId }).toArray();

    // De most minden országot visszaadunk:
    const countries = await db.collection('Countries').find({}).toArray();

    if (!countries || countries.length === 0) {
      return new Response(JSON.stringify({ error: 'No countries found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(countries), {
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

    if (!body.Name || typeof body.Name !== 'string' || !body.Name.trim()) {
      return new Response(JSON.stringify({ error: 'A név kötelező' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // A Continent egész szám, vagy null, ha nincs megadva
    let continent = null;
    if (body.Continent !== null && body.Continent !== undefined && body.Continent !== '') {
      continent = Number(body.Continent);
      if (!Number.isInteger(continent)) {
        return new Response(JSON.stringify({ error: 'A Continent egész szám kell legyen' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const client = await clientPromise;
    const db = client.db('FormulaOne');

    const result = await db.collection('Countries').insertOne({
      Name: body.Name.trim(),
      Continent: continent,
      Flag: body.Flag || '',
    });

    return new Response(JSON.stringify({ _id: result.insertedId }), {
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
