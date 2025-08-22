import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req) {
  const url = new URL(req.url);
  const _id = url.searchParams.get("_id");
  console.log("_id:", _id);

  try {
    const client = await clientPromise;
    const db = client.db("FormulaOne");

    // Ha _id kellene szűréshez:
    // const objectId = new ObjectId(_id);
    // const countries = await db.collection("Countries").find({ _id: objectId }).toArray();

    // De most minden országot visszaadunk:
    const countries = await db.collection("Countries").find({}).toArray();

    if (!countries || countries.length === 0) {
      return new Response(JSON.stringify({ error: "No countries found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(countries), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("API error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
