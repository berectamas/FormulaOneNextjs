import clientPromise from "../../../../lib/mongodb";

export async function GET(req, { params }) {
  const { year } = await params;

  try {
    const client = await clientPromise;
    const db = client.db("FormulaOne");
    const yearNumber = parseInt(year, 10);
        if (isNaN(yearNumber)) {
        return new Response(JSON.stringify({ error: "Invalid year parameter" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
        }
    const raceArray = await db.collection("RaceInformations").aggregate([
      // Track csatlakoztatása
      {
        $lookup: {
          from: "Calendars",
          localField: "CalendarId",
          foreignField: "_id",
          as: "Calendar",
        },
      },
      { $unwind: { path: "$Calendar", preserveNullAndEmptyArrays: true } },
        { $match: { "Calendar.Year": yearNumber} }, // pl. 2025-re szűrés

      //Track csatlakoztatása

    {
        $lookup: {
          from: "Tracks",
          localField: "Calendar.TrackId",
          foreignField: "_id",
          as: "Calendar.Track",
        },
      },
      { $unwind: { path: "$Calendar.Track", preserveNullAndEmptyArrays: true } },
      /*
      // Country csatlakoztatása a Track-hez
      {
        $lookup: {
          from: "Countries",
          localField: "Calendar.Track.CountryId",
          foreignField: "_id",
          as: "Calendar.Track.Country",
        },
      },
      { $unwind: { path: "$Calendar.Track.Country", preserveNullAndEmptyArrays: true } },*/
      /*
      // TrackSpecifications csatlakoztatása
      {
        $lookup: {
          from: "TrackSpecifications",
          localField: "Calendar.Track._id",
          foreignField: "TrackId",
          as: "Calendar.Track.TrackSpecifications",
        },
      },

      // TrackImages minden specification-höz
      { $unwind: { path: "$Calendar.Track.TrackSpecifications", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "TrackImages",
          localField: "Calendar.Track.TrackSpecifications._id",
          foreignField: "TrackSpecificationId",
          as: "Calendar.Track.TrackSpecifications.Images",
        },
      },*/


      // Driver és Team adatok csatlakoztatása minden eredményhez
      //{ $unwind: { path: "$Calendar.Track.TrackSpecifications.Images", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "Drivers",
          localField: "DriverId",
          foreignField: "_id",
          as: "Driver",
        },
      },
      { $unwind: { path: "$Driver", preserveNullAndEmptyArrays: true } },
      // Country csatlakoztatása
      /*
      {
        $lookup: {
          from: "Countries",
          localField: "Driver.CountryId",
          foreignField: "_id",
          as: "Driver.Country",
        },
      },
      { $unwind: { path: "$Driver.Country", preserveNullAndEmptyArrays: true } },
       // Images csatlakoztatása
      {
        $lookup: {
          from: "DriverImages",
          localField: "DriverId",
          foreignField: "DriverId",
          as: "Driver.Images",
        },
      },
      //{ $unwind: { path: "$Driver.Images", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "DriverYears",
          localField: "DriverId",
          foreignField: "DriverId",
          as: "Driver.Years",
        },
      },
      //{ $unwind: { path: "$Driver.Years", preserveNullAndEmptyArrays: true } },*/
      {
        $lookup: {
          from: "Teams",
          localField: "TeamId",
          foreignField: "_id",
          as: "Team",
        },
      },
      { $unwind: { path: "$Team", preserveNullAndEmptyArrays: true } },
            // Country csatlakoztatása
      /*{
        $lookup: {
          from: "Countries",
          localField: "Team.CountryId",
          foreignField: "_id",
          as: "Team.Country",
        },
      },
      { $unwind: { path: "$Team.Country", preserveNullAndEmptyArrays: true } },*/
      {
        $lookup: {
          from: "TeamByYear",
          localField: "TeamId",
          foreignField: "TeamId",
          as: "Team.Years",
        },
      },

    /*{
      $addFields: {
        "Driver.Years": { $sortArray: { input: "$Driver.Years", sortBy: { Year: 1 } } },
        "Team.Years": { $sortArray: { input: "$Team.Years", sortBy: { Year: 1 } } }
      }
    }*/

    ]).toArray();


    const races = raceArray;

    if (!races.length) {
      return new Response(JSON.stringify({ error: "Race not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(races), {
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
