"use client";

import Link from "next/link";

export default function CalendarList({ year, events }) {
  if (!events || !events.length)
    return <div className="p-8 text-center">No events found</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">F1 Calendar {year}</h1>
      <ul className="space-y-8">
        {events.map((event) => {
          const lastSpec = event.Track?.Specifications?.[event.Track.Specifications.length - 1];
          const trackImageUrl = lastSpec?.Images?.length
            ? lastSpec.Images[lastSpec.Images.length - 1].URL
            : "/f1.png";

          return (
            <Link href={`/pages/race/${event._id}`} key={event._id} className="block">
              <li className="border rounded shadow hover:shadow-lg transition overflow-hidden flex flex-col md:flex-row cursor-pointer">
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
