"use client";
import Link from "next/link";

export default function Navbar() {
  const currentYear = new Date().getFullYear();
  const year = new Date().getFullYear();
  return (
    <nav className="w-full bg-black text-white shadow-md">
      <div className="flex justify-between h-16 items-center px-4 sm:px-6 lg:px-8">
        
        {/* Logo teljesen balra */}
        <div className="flex items-center h-16">
          <img
            src="/f1.png"
            alt="F1 logo"
            width={64}
            height={64}
            className="object-contain"
          />
          <span className="ml-3 text-xl font-bold">Formula One</span>
        </div>

        {/* Linkek jobbra */}
        <div className="flex space-x-6">
          <Link href="/" className="hover:text-gray-300">Home</Link>
          <Link href="/pages/countries" className="hover:text-gray-300">Countries</Link>
          <Link href="/pages/tracks" className="hover:text-gray-300">Tracks</Link>
          <Link href="/pages/drivers" className="hover:text-gray-300">Drivers</Link>
          <Link href="/pages/teams" className="hover:text-gray-300">Teams</Link>
          <Link href={`/pages/calendars?year=${currentYear}`} className="hover:text-gray-300">
            Calendar
          </Link>
          <Link href={{
              pathname: `/pages/standings/${year}`,
            }}
            className="hover:text-gray-300">
              Standings
          </Link>

        </div>

      </div>
    </nav>
  );
}
