// app/calendar/page.jsx (Next.js 13+ App Router)
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";



export default function Page() {
  const searchParams = useSearchParams();
  const year = searchParams.get("year") || new Date().getFullYear();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const updateAndFetch = async () => {
      try {
        // 1️⃣ Frissítjük a Tracks kollekció CountryId mezőit
        //const updateRes = await fetch("/api/update-tracks-countryid", { method: "POST" });
        //const updateData = await updateRes.json();
        //console.log("Tracks update result:", updateData);

        // 2️⃣ Lekérjük a countries adatokat
        const res = await fetch(`/api/calendars?year=${year}`);
        const resData = await res.json();
        setEvents(resData);
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
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">F1 Calendar  {year}</h1>
      <ul className="space-y-8">
        {events.map(event => {
          // Ha van TrackImages, a legutolsó képet használjuk
      const lastSpec = event.Track?.Specifications?.[event.Track.Specifications.length - 1];
      const trackImageUrl = lastSpec?.Images?.length
        ? lastSpec.Images[lastSpec.Images.length - 1].URL
        : "/f1.png";


          return (
            <Link href={`/pages/race/${event._id}`} 
                  className="block"
                  key={event._id} 
            >
              <li
                key={event._id}
                className="border rounded shadow hover:shadow-lg transition overflow-hidden flex flex-col md:flex-row cursor-pointer"
              >
                <div className="flex-shrink-0 w-full md:w-48 h-32 md:h-auto overflow-hidden">
                  <img
                    src={trackImageUrl}
                    alt={event.Track?.Name || "Track"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex-1">
                  <p className="font-semibold text-lg">
                    {event.Round}. {event.Name} ({event.Date})
                  </p>
                  <p className="mt-1">
                    Track: <span className="font-medium">{event.Track?.Name}</span>
                  </p>
                  {event.Track?.Country && (
                    <div className="flex items-center mt-2">
                      <img
                        src={event.Track.Country.Flag}
                        alt={event.Track.Country.Name}
                        className="w-6 h-4 mr-2 object-cover"
                      />
                      <span>{event.Track.Country.Name}</span>
                    </div>
                  )}
                  {event.IsSprintEvent && (
                    <p className="text-sm text-red-500 mt-1">Sprint Event</p>
                  )}
                </div>
              </li>
            </Link>
          );
        })}
      </ul>
    </div>
  );
}