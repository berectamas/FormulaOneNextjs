"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Page() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateAndFetch = async () => {
      try {
        // 1️⃣ Frissítjük a Tracks kollekció CountryId mezőit
        //const updateRes = await fetch("/api/update-tracks-countryid", { method: "POST" });
        //const updateData = await updateRes.json();
        //console.log("Tracks update result:", updateData);

        // 2️⃣ Lekérjük a countries adatokat
        const tracksRes = await fetch("/api/tracks");
        const tracksData = await tracksRes.json();
        setTracks(tracksData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    updateAndFetch();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
<div className="font-sans min-h-screen p-8 sm:p-20">
  <main className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
    {tracks.map((track, index) => {
      const trackSpec = track.TrackSpecifications?.[track.TrackSpecifications.length - 1];
      const lastImageUrl = trackSpec?.TrackImages?.length
        ? trackSpec.TrackImages[trackSpec.TrackImages.length - 1].URL
        : "/placeholder.png";

      return (
        <div
          key={index}
          className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition flex flex-col items-center"
        >
          {/* Fő kép - fix méret, arányos */}
          <Image
            src={lastImageUrl}
            alt={track.Name || "Track"}
            width={250}  // kártya szélességhez igazítva
            height={140} // kártya magasság
            className="object-contain"
          />

          {/* Track neve */}
          <div className="p-4 flex flex-col items-center w-full">
            <h2 className="text-lg font-semibold text-center">{track.Name}</h2>

            {/* Ország info */}
            <div className="flex items-center mt-2">
              <Image
                src={track.Country?.Flag || "/placeholder-flag.png"}
                alt={track.Country?.Name || "Country"}
                width={20}
                height={12}
                className="rounded-sm mr-2"
              />
              <span className="text-gray-600 text-sm">{track.Country?.Name}</span>
            </div>
          </div>
        </div>
      );
    })}
  </main>
</div>



  );
}
