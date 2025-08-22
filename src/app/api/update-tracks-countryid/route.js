// app/api/update-tracks-countryid/route.js
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("FormulaOne");
    const tracks = db.collection("TeamByYear");

    const cursor = tracks.find({});
    let updatedCount = 0;

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      if (doc.TeamId && typeof doc.TeamId === "string" && ObjectId.isValid(doc.TeamId)) {
        await tracks.updateOne(
          { _id: doc._id },
          { $set: { TeamId: new ObjectId(doc.TeamId) } }
        );
        updatedCount++;
      }
    }

    // App Router esetén: Response JSON-nel
    return new Response(JSON.stringify({ message: "Update completed", updatedCount }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Server error", error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
