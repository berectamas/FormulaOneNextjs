'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Page() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hover, setHover] = useState(false); // <-- ez hiányzik

  useEffect(() => {
    const updateAndFetch = async () => {
      try {
        // 1️⃣ Frissítjük a Tracks kollekció CountryId mezőit
        //const updateRes = await fetch("/api/update-tracks-countryid", { method: "POST" });
        //const updateData = await updateRes.json();
        //console.log("Tracks update result:", updateData);

        // 2️⃣ Lekérjük a countries adatokat
        const tracksRes = await fetch('/api/tracks');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tracks</h1>
          <p className="text-gray-500 text-sm mt-1">{tracks.length} pálya az adatbázisban</p>
        </div>

        <Link
          href="/pages/tracks/new"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            marginBottom: '24px',
            borderRadius: '9999px',
            backgroundColor: hover ? '#c7d2fe' : '#e0e7ff',
            color: '#4338ca',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            border: '1px solid #c7d2fe',
            boxShadow: hover
              ? '0 8px 16px rgba(129, 140, 248, 0.3)'
              : '0 2px 6px rgba(129, 140, 248, 0.2)',
            transform: hover ? 'translateY(-2px)' : 'translateY(0)',
            transition: 'all 0.2s ease',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transition: 'transform 0.2s ease',
              transform: hover ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Új track
        </Link>
      </div>
      <main className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {tracks.map((track, index) => {
          const trackSpec = track.TrackSpecifications?.[track.TrackSpecifications.length - 1];
          const lastImageUrl = trackSpec?.TrackImages?.length
            ? trackSpec.TrackImages[trackSpec.TrackImages.length - 1].URL
            : '/placeholder.png';

          return (
            <div
              className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition flex flex-col items-center"
              key={track._id}
            >
              {/* Fő kép konténer */}
              <div className="relative w-[250px] h-[140px]">
                <Image
                  src={lastImageUrl}
                  alt={track.Name || 'Track'}
                  fill
                  style={{ objectFit: 'contain' }}
                  className="rounded-t-xl"
                  sizes="250px"
                  priority
                />
              </div>

              {/* Track neve */}
              <div className="p-4 flex flex-col items-center w-full">
                <h2 className="text-lg font-semibold text-center">{track.Name}</h2>

                {/* Ország info */}
                <div className="flex items-center mt-2">
                  <div className="relative w-[20px] h-[12px]">
                    <Image
                      src={track.Country?.Flag || '/placeholder-flag.png'}
                      alt={track.Country?.Name || 'Country'}
                      fill
                      style={{ objectFit: 'contain' }}
                      className="rounded-sm"
                      sizes="20px"
                    />
                  </div>
                  <span className="text-gray-600 text-sm ml-2">{track.Country?.Name}</span>
                </div>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
