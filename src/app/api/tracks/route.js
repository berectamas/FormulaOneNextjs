import clientPromise from "../../lib/mongodb";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("FormulaOne");

    const tracks = await db.collection("Tracks").aggregate([
      // Csatlakoztatjuk a Country-t (ha kell)
      {
        $lookup: {
          from: "Countries",
          localField: "CountryId",
          foreignField: "_id",
          as: "Country",
        },
      },
      { $unwind: { path: "$Country", preserveNullAndEmptyArrays: true } },

      // Csatlakoztatjuk a trackSpecifications-t
      {
        $lookup: {
          from: "TrackSpecifications",
          localField: "_id",
          foreignField: "TrackId",
          as: "TrackSpecifications",
        },
      },

      // Minden specification-hoz csatlakoztatjuk a trackImages-t
      { $unwind: { path: "$TrackSpecifications", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "TrackImages",
          localField: "TrackSpecifications._id",
          foreignField: "TrackSpecificationId",
          as: "TrackSpecifications.TrackImages",
        },
      },
      {
        $group: {
          _id: "$_id",
          Name: { $first: "$Name" },
          Description: { $first: "$Description" },
          CountryId: { $first: "$CountryId" },
          Country: { $first: "$Country" },
          TrackSpecifications: { $push: "$TrackSpecifications" },
        },
      },
    ]).toArray();

    if (!tracks || tracks.length === 0) {
      return new Response(JSON.stringify({ error: "No tracks found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(tracks), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("API error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
