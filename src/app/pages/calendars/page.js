import CalendarList from './CalendarList'; // client component

export default async function Page({ searchParams }) {
  // await kell, hogy biztosan elérd a searchParams-t
  const params = await searchParams;
  const year = parseInt(params?.year) || new Date().getFullYear();

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/calendars?year=${year}`);
  const events = await res.json();

  return <CalendarList year={year} events={events} />;
}
