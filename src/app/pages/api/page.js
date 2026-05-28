'use client';

import { useEffect, useState } from 'react';

export default function Api() {
  const [year, setYear] = useState(2026);
  const [round, setRound] = useState(1);
  const [session, setSession] = useState(0);
  const [drivers, setDrivers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendars, setCalendars] = useState([]);
  const statusMap = {
    Finished: 0,
    Retired: 1,
    DSQ: 2,
    Disqualified: 2,
    'Did not start': 3,
    DNS: 3,
  };
  useEffect(() => {
    async function fetchRace() {
      try {
        const res = await fetch(`/api/drivers/year/${year}`);
        const data = await res.json();
        setDrivers(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchRace();
  }, [year]);

  useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await fetch(`/api/teams/year/${year}`);
        const data = await res.json();
        setTeams(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error('Team fetch error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTeams();
  }, [year]);
  useEffect(() => {
    async function fetchCalendars() {
      try {
        const res = await fetch(`/api/calendars?year=${year}`);
        const data = await res.json();
        setCalendars(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchCalendars();
  }, [year]);

  const handleClick = async () => {
    try {
      const res = await fetch(`/api/raceresults/${year}/${round}/${session}`);

      if (!res.ok) {
        console.error(await res.text());
        return;
      }

      const data = await res.json();
      console.log(data);
      let mapped = [];

      if (session === 0 || session === 4) {
        mapped = generateRaceInformations(data);
      }

      if (session > 0 && session < 4) {
        mapped = generateQualyInformations(data);
      }
      console.log(mapped);
      if (mapped?.length > 0) {
        await saveAll(mapped);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const saveAll = async (data) => {
    const res = await fetch('/api/races/addMany', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    console.log(result);
  };
  const generateRaceInformations = (data) => {
    if (!Array.isArray(data)) return [];

    const mapped = data.map((item) => {
      const totalMs = item.Time?.millis || 0;

      const hours = Math.floor(totalMs / (1000 * 60 * 60));
      const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((totalMs % (1000 * 60)) / 1000);
      const milliseconds = totalMs % 1000;
      return {
        CalendarId: calendars.find((c) => c.Round === round)._id,
        Position: Number(item.position ?? 0),

        DriverId: drivers.find((d) => d.RacingNumber === Number(item.Driver.permanentNumber))?._id,
        TeamId: teams.find((t) => t.Name?.toLowerCase() === item.Constructor.name?.toLowerCase())
          ?._id,

        LapsCompleted: Number(item.laps ?? 0),

        Hours: hours,
        Minutes: minutes,
        Seconds: seconds,
        Miliseconds: milliseconds,

        FinishingStatus: statusMap[item.status] ?? 0, //kész

        RaceEvent: session,

        GridPosition: Number(item.grid ?? 0),
      };
    });

    console.log('Mapped race infos:', mapped);

    return mapped;
  };
  const generateQualyInformations = (data) => {
    if (!Array.isArray(data)) return [];

    const mapped = data
      .map((item) => {
        let parts = [];
        if (session === 1) parts = item.Q1?.split(':');
        if (session === 2) parts = item.Q2?.split(':');
        if (session === 3) parts = item.Q3?.split(':');
        if (!parts) return null;
        const minutes = Number(parts[0]);
        const secondParts = (parts[1] ?? '0.000').split('.');
        const seconds = Number(secondParts[0] ?? 0);
        const milliseconds = Number(secondParts[1] ?? 0);
        const totalMilliseconds = minutes * 60 * 1000 + seconds * 1000 + milliseconds;
        return {
          CalendarId: calendars.find((c) => c.Round === round)._id,
          DriverId: drivers.find((d) => d.RacingNumber === Number(item.Driver.permanentNumber))
            ?._id,
          Driver: drivers.find((d) => d.RacingNumber === Number(item.Driver.permanentNumber)),
          TeamId: teams.find((t) => t.Name?.toLowerCase() === item.Constructor.name?.toLowerCase())
            ?._id,

          LapsCompleted: Number(item.laps ?? 0),

          Hours: 0,
          Minutes: minutes,
          Seconds: seconds,
          Miliseconds: milliseconds,

          FinishingStatus: statusMap[item.status] ?? 0, //kész
          RaceEvent: session,
          GridPosition: Number(item.grid ?? 0),
          TotalMilliseconds: totalMilliseconds,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a.TotalMilliseconds === 0) return 1;
        if (b.TotalMilliseconds === 0) return -1;

        return a.TotalMilliseconds - b.TotalMilliseconds;
      })
      .map((item, index) => ({
        ...item,
        Position: index + 1,
      }));

    console.log('Mapped race infos:', mapped);
    /*
          try {
      const response = await fetch('/api/races/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInfo),
      });

      const data = await response.json();
      if (data.success) {
        // MongoDB sikeres mentés után frissítjük a helyi listát
        setRaceInfos([...raceInfos, { ...newInfo, _id: data.insertedId }]);
        setShowModal(false);
      } else {
        alert('Mentési hiba történt: ' + data.error);
      }
    } catch (err) {
      console.error('Error saving race info:', err);
      alert('Nem sikerült menteni az adatot.');
    }
      */
    return mapped;
  };
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          placeholder="Year"
          style={inputStyle}
        />

        <input
          type="number"
          value={round}
          onChange={(e) => setRound(Number(e.target.value))}
          placeholder="Round"
          style={inputStyle}
        />

        <input
          type="number"
          value={session}
          onChange={(e) => setSession(Number(e.target.value))}
          placeholder="Session"
          style={inputStyle}
        />

        <button onClick={handleClick} style={buttonStyle}>
          Lekér
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100px',
  padding: '10px',
  fontSize: '14px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  textAlign: 'center',
};

const buttonStyle = {
  padding: '10px 15px',
  fontSize: '14px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  backgroundColor: '#007bff',
  color: 'white',
};
