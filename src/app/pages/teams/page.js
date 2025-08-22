"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Page() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateAndFetch = async () => {
      try {
        // 1️⃣ Frissítjük a Tracks kollekció CountryId mezőit
        //const updateRes = await fetch("/api/update-tracks-countryid", { method: "POST" });
        //const updateData = await updateRes.json();
        //console.log("Tracks update result:", updateData);

        // 2️⃣ Lekérjük a countries adatokat
        const res = await fetch("/api/teams");
        const teamsData = await res.json();
        setTeams(teamsData);
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
    {teams.map((team, index) => {
      return (
        <div
          key={index}
          className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition flex flex-col items-center"
        >
          {/* Fő kép - fix méret, arányos */}
         <div className="relative w-[250px] h-[140px]">
            <Image
              src={team.Logo || "/f1.png"}
              alt={team.Name || "Team"}
                fill
                style={{ objectFit: "contain" }}
                className="rounded-t-xl"
                sizes="250px"
                priority
            />
          </div>

          {/* Track neve */}
          <div className="p-4 flex flex-col items-center w-full">
            <h2 className="text-lg font-semibold text-center">{team.Name}</h2>

            {/* Ország info */}
            <div className="flex items-center mt-2">
              <div className="relative w-[20px] h-[12px]">
                <Image
                  src={team.Country?.Flag || "/f1.png"}
                  alt={team.Country?.Name || "Country"}
                    fill
                    style={{ objectFit: "contain" }}
                    className="rounded-md"
                    sizes="20px"
                    priority
                />
              </div>
              <span className="text-gray-600 text-sm">{team.Country?.Name}</span>
            </div>
          </div>
        </div>
      );
    })}
  </main>
</div>



  );
}
