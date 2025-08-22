import CalendarList from "./CalendarList"; // segédfájl, client component

export default async function Page({ searchParams }) {
  const year = searchParams?.year || new Date().getFullYear();

  // Adj meg abszolút URL-t, pl. Vercel-en az ENV változó
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/calendars?year=${year}`);
  const events = await res.json();

  return <CalendarList year={year} events={events} />;
}

