import clientPromise from "../../lib/mongodb";

export async function GET(req, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("FormulaOne");

    const drivers = await db.collection("Drivers").aggregate([
      // Country csatlakoztatása
      {
        $lookup: {
          from: "Countries",
          localField: "CountryId",
          foreignField: "_id",
          as: "Country",
        },
      },
      { $unwind: { path: "$Country", preserveNullAndEmptyArrays: true } },

      // DriverYears csatlakoztatása
      {
        $lookup: {
          from: "DriverYears",
          localField: "_id",
          foreignField: "DriverId",
          as: "Years",
        },
      },

      // DriverImages csatlakoztatása
      {
        $lookup: {
          from: "DriverImages",
          localField: "_id",
          foreignField: "DriverId",
          as: "Images",
        },
      },

      // (Opcionális: rendezés, pl. Year szerint)
      { $sort: { "Years.Year": 1 } }

    ]).toArray();

    if (!drivers || drivers.length === 0) {
      return new Response(JSON.stringify({ error: "No drivers found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(drivers), {
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
