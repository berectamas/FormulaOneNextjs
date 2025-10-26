'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

export default function RacePage() {
  const { id } = useParams();
  const [raceInfos, setRaceInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  // Modal állapota
  const [showModal, setShowModal] = useState(false);
  const [newRowData, setNewRowData] = useState({
    Position: '',
    DriverName: '',
    TeamName: '',
    LapsCompleted: 0,
    Hours: 0,
    Minutes: 0,
    Seconds: 0,
    Miliseconds: 0,
    FinishingStatus: 0,
    GridPosition: 0,
    IsFastestLapOnTheRace: false,
    RaceEvent: 0,
  });
  const [drivers, setDrivers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [currentCalendar, setcurrentCalendar] = useState(null);

  // API hívás a versenyzők és csapatok lekérésére
  useEffect(() => {
    async function fetchDropdownData() {
      try {
        const [driversRes, teamsRes, calRes, currentCalRes] = await Promise.all([
          fetch('/api/drivers'),
          fetch('/api/teams'),
          fetch('/api/calendars'),
          fetch(`/api/calendars/${id}`),
        ]);
        const driversData = await driversRes.json();
        const teamsData = await teamsRes.json();
        const calsData = await calRes.json();
        const currentCalendarData = await currentCalRes.json();

        setDrivers(driversData);
        setTeams(teamsData);
        setCalendars(calsData);
        setcurrentCalendar(currentCalendarData);
      } catch (err) {
        console.error('Dropdown fetch error:', err);
      }
    }
    fetchDropdownData();
  }, []);

  const raceEventTypes = [
    { label: 'Race', value: 0 },
    { label: 'Q1', value: 1 },
    { label: 'Q2', value: 2 },
    { label: 'Q3', value: 3 },
    ...(currentCalendar && currentCalendar.IsSprintEvent
      ? [
          { label: 'Sprint', value: 4 },
          { label: 'SQ1', value: 5 },
          { label: 'SQ2', value: 6 },
          { label: 'SQ3', value: 7 },
        ]
      : []),
  ];
  const f1CurrentSprintPoints = [8, 7, 6, 5, 4, 3, 2, 1];
  const f1CurrentRacePoints = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
  const f1CurrentPoints = [f1CurrentRacePoints, f1CurrentSprintPoints];
  useEffect(() => {
    async function fetchRace() {
      try {
        const res = await fetch(`/api/races/${id}`);
        const data = await res.json();
        setRaceInfos(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchRace();
  }, [id]);

  if (loading) return <p>Loading race data...</p>;
  if (!raceInfos.length) return <p>No race data found.</p>;

  const sortedRaceInfos = [...raceInfos].sort((a, b) => a.Position - b.Position);
  const filteredRaceInfos = sortedRaceInfos.filter(
    (info) => info.RaceEvent === raceEventTypes[activeTab].value,
  );

  const formatTime = (info) => {
    if (!info || info.Hours === undefined) return null;

    const h = String(info.Hours).padStart(2, '0');
    const m = String(info.Minutes).padStart(2, '0');
    const s = String(info.Seconds).padStart(2, '0');
    const ms = String(info.Miliseconds).padStart(3, '0');

    return `${h}:${m}:${s}.${ms}`;
  };

  const getTimeDisplay = (info, first, firstInfo) => {
    // Ellenőrizzük a FinishingStatus-t
    if (info.FinishingStatus === 1) return 'DNF';
    if (info.FinishingStatus === 2) return 'DSQ';
    if (info.FinishingStatus === 3) return 'DNS';

    const isZeroTime =
      info.Hours === 0 && info.Minutes === 0 && info.Seconds === 0 && info.Miliseconds === 0;

    if (first) {
      return isZeroTime ? '-' : formatTime(info);
    }
    const diff = firstInfo.LapsCompleted - info.LapsCompleted;
    if (firstInfo && diff !== 0) {
      return '+' + diff.toString() + ' lap' + (diff > 1 ? 's' : '');
    }

    if (!isZeroTime && firstInfo) {
      // Delta az elsőhöz képest a tabon belül
      const msInfo =
        info.Hours * 3600000 + info.Minutes * 60000 + info.Seconds * 1000 + info.Miliseconds;

      const msFirst =
        firstInfo.Hours * 3600000 +
        firstInfo.Minutes * 60000 +
        firstInfo.Seconds * 1000 +
        firstInfo.Miliseconds;

      const deltaMs = msInfo - msFirst;

      const dH = Math.floor(deltaMs / 3600000);
      const dM = Math.floor(deltaMs / 60000) % 60;
      const dS = Math.floor(deltaMs / 1000) % 60;
      const dMS = Math.abs(deltaMs % 1000);

      if (dH > 0) {
        return `+${dH}:${String(dM).padStart(2, '0')}:${String(dS).padStart(2, '0')}.${String(
          dMS,
        ).padStart(3, '0')}`;
      } else if (dM > 0) {
        return `+${dM}:${String(dS).padStart(2, '0')}.${String(dMS).padStart(3, '0')}`;
      } else if (dS > 0) {
        return `+${dS}.${String(dMS).padStart(3, '0')}`;
      } else {
        return `+0.${String(dMS).padStart(3, '0')}`;
      }
    }

    // Ha 00:00:00.000, nézzük a teljesített köröket
    if (firstInfo) {
      const lapsBehind = firstInfo.LapsCompleted - info.LapsCompleted;
      if (lapsBehind > 0) return `+${lapsBehind} lap${lapsBehind > 1 ? 's' : ''}`;
    }
    return '-';
  };
  // Popup megnyitása és új sor hozzáadása
  const addNewRow = (raceEvent) => {
    setShowModal(true);
    setNewRowData({
      Position:
        filteredRaceInfos.length > 0
          ? Math.max(...filteredRaceInfos.map((r) => r.Position)) + 1
          : 1,
      DriverId: '',
      TeamId: '',
      LapsCompleted:
        filteredRaceInfos.length > 0
          ? Math.max(...filteredRaceInfos.map((r) => r.LapsCompleted))
          : 1,
      Hours: 0,
      Minutes: 0,
      Seconds: 0,
      Miliseconds: 0,
      FinishingStatus:
        filteredRaceInfos.length > 0
          ? Math.max(...filteredRaceInfos.map((r) => r.FinishingStatus))
          : 0,
      RaceEvent: raceEvent,
      GridPosition: 0,
    });
  };

  const handleSaveNewRow = async () => {
    const firstInfo = filteredRaceInfos[0];

    let deltaH = Number(newRowData.Hours);
    let deltaM = Number(newRowData.Minutes);
    let deltaS = Number(newRowData.Seconds);
    let deltaMS = Number(newRowData.Miliseconds);

    if (firstInfo) {
      // Számoljuk az elsőhöz képesti különbséget ms-ban
      const firstMs =
        firstInfo.Hours * 3600000 +
        firstInfo.Minutes * 60000 +
        firstInfo.Seconds * 1000 +
        firstInfo.Miliseconds;

      const newMs = deltaH * 3600000 + deltaM * 60000 + deltaS * 1000 + deltaMS;

      const totalDeltaMs = newMs + firstMs;

      deltaH = Math.floor(totalDeltaMs / 3600000);
      deltaM = Math.floor((totalDeltaMs % 3600000) / 60000);
      deltaS = Math.floor((totalDeltaMs % 60000) / 1000);
      deltaMS = totalDeltaMs % 1000;
    }

    const newInfo = {
      _id: Date.now(), // ideiglenes ID
      CalendarId: id,
      Calendar: calendars.find((f) => f._id === id),
      Position: Number(newRowData.Position),
      DriverId: newRowData.DriverId,
      Driver: drivers.find((f) => f._id === newRowData.DriverId),
      TeamId: newRowData.TeamId,
      Team: teams.find((f) => f._id === newRowData.TeamId),
      LapsCompleted: Number(newRowData.LapsCompleted),
      Hours: deltaH,
      Minutes: deltaM,
      Seconds: deltaS,
      Miliseconds: deltaMS,
      FinishingStatus: Number(newRowData.FinishingStatus),
      RaceEvent: newRowData.RaceEvent,
      GridPosition: Number(newRowData.GridPosition),
      IsFastestLapOnTheRace: false,
    };
    console.log(newInfo);
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
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">
        {currentCalendar ? `${currentCalendar.Name} - ${currentCalendar.Year}` : 'Loading...'}
      </h1>

      {/* Tab gombok */}
      <div className="flex space-x-2 mb-4">
        {raceEventTypes.map((tab, idx) => (
          <button
            key={tab.value}
            className={`px-4 py-2 rounded ${
              activeTab === idx
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveTab(idx)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab tartalom */}

      <div className="space-y-3">
        {filteredRaceInfos.length === 0 && <p>No results for this session.</p>}

        {/* Fejléc */}
        <div className="flex px-3 py-2 border-b font-bold text-gray-700">
          <div className="w-[60px]">Pos</div>
          <div className="w-[60px]"></div> {/* driver kép helye */}
          <div className="flex-1">Driver / Team</div>
          {filteredRaceInfos.some((info) => info.RaceEvent % 4 === 0) ? (
            <>
              <div className="w-[80px] text-center">Laps</div>
              <div className="w-[100px] text-right">Points / Time</div>
            </>
          ) : (
            <div className="w-[100px] text-right">Time</div>
          )}
        </div>

        {/* Tartalom */}
        {filteredRaceInfos.map((info, idx) => (
          <div
            key={`${info._id}-${info.Position}`}
            className="flex items-center px-3 py-2 border rounded shadow"
          >
            <div className="w-[40px] font-bold text-lg">{info.Position}</div>

            <div className="w-[80px] h-[80px] relative">
              {info.Driver?.Images?.[0]?.ImageUrl && (
                <Image
                  src={info.Driver.Images[0].ImageUrl}
                  alt={`${info.Driver.FirstName} ${info.Driver.LastName}`}
                  fill
                  sizes="60px"
                  style={{ objectFit: 'contain' }}
                  className="rounded-full"
                  priority={idx === 0} // az első kép legyen előtöltve, ha above-the-fold
                />
              )}
            </div>

            <div className="flex-1">
              <p className="font-medium">
                {info.Driver?.FirstName} {info.Driver?.LastName}
              </p>
              <p className="text-sm text-gray-500">{info.Team?.Name}</p>
            </div>

            {info.RaceEvent % 4 === 0 && (
              <div className="w-[80px] text-center font-bold text-lg">{info.LapsCompleted}</div>
            )}

            <div className="w-[100px] text-right">
              <div className="w-[100px] text-right">
                {info.RaceEvent % 4 === 0 ? (
                  <p className="font-bold text-lg">
                    + {f1CurrentPoints[info.RaceEvent / 4][info.Position - 1] ?? 0}
                  </p>
                ) : (
                  <p className="font-bold text-lg">{formatTime(info)}</p>
                )}
              </div>
              <p className="font-bold text-lg">
                {idx === 0
                  ? formatTime(info)
                  : getTimeDisplay(info, idx === 0, filteredRaceInfos[0])}
              </p>
              <p className="text-sm text-gray-600">{formatTime(info)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="w-full mt-2">
        <button
          className="w-full px-4 py-3 bg-black text-white font-bold rounded hover:bg-gray-800 transition"
          onClick={() => addNewRow(raceEventTypes[activeTab].value)}
        >
          Új elem felvétele
        </button>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl w-96 max-w-full p-6 transform transition-transform duration-300 scale-95 animate-fade-in">
            <h2 className="text-2xl font-extrabold mb-6 text-center text-gray-900">
              Új elem hozzáadása
            </h2>

            <div className="space-y-4">
              <label className="block text-gray-700">
                Position:
                <input
                  type="number"
                  className="border rounded-xl p-2 w-full mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200"
                  value={newRowData.Position}
                  onChange={(e) => setNewRowData({ ...newRowData, Position: e.target.value })}
                />
              </label>

              <label className="block text-gray-700">
                Driver:
                <select
                  className="border rounded-xl p-2 w-full mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200"
                  value={newRowData.DriverId}
                  onChange={(e) => setNewRowData({ ...newRowData, DriverId: e.target.value })}
                >
                  <option value="">Válassz versenyzőt</option>
                  {drivers.map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.FirstName} {driver.LastName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-gray-700">
                Team:
                <select
                  className="border rounded-xl p-2 w-full mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200"
                  value={newRowData.TeamId}
                  onChange={(e) => setNewRowData({ ...newRowData, TeamId: e.target.value })}
                >
                  <option value="">Válassz csapatot</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.Name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-gray-700">
                Laps Completed:
                <input
                  type="number"
                  className="border rounded-xl p-2 w-full mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200"
                  value={newRowData.LapsCompleted}
                  onChange={(e) => setNewRowData({ ...newRowData, LapsCompleted: e.target.value })}
                />
              </label>
              <label className="block text-gray-700">
                Grid Position:
                <input
                  type="number"
                  className="border rounded-xl p-2 w-full mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200"
                  value={newRowData.GridPosition}
                  onChange={(e) => setNewRowData({ ...newRowData, GridPosition: e.target.value })}
                />
              </label>
              <label className="flex items-center text-gray-700">
                <span className="mr-2">Fastest Lap:</span>
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-blue-500 focus:ring-2 focus:ring-blue-400 transition duration-200"
                  checked={newRowData.IsFastestLapOnTheRace || false}
                  onChange={(e) =>
                    setNewRowData({
                      ...newRowData,
                      IsFastestLapOnTheRace: e.target.checked,
                    })
                  }
                />
              </label>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-gray-700 mb-1">Hours</label>
                  <input
                    type="number"
                    placeholder="H"
                    className="border rounded-xl p-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200"
                    value={newRowData.Hours}
                    onChange={(e) => setNewRowData({ ...newRowData, Hours: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Minutes</label>
                  <input
                    type="number"
                    placeholder="M"
                    className="border rounded-xl p-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200"
                    value={newRowData.Minutes}
                    onChange={(e) => setNewRowData({ ...newRowData, Minutes: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Seconds</label>
                  <input
                    type="number"
                    placeholder="S"
                    className="border rounded-xl p-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200"
                    value={newRowData.Seconds}
                    onChange={(e) => setNewRowData({ ...newRowData, Seconds: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Milliseconds</label>
                  <input
                    type="number"
                    placeholder="MS"
                    className="border rounded-xl p-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200"
                    value={newRowData.Miliseconds}
                    onChange={(e) => setNewRowData({ ...newRowData, Miliseconds: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all duration-200 shadow-sm"
                onClick={() => setShowModal(false)}
              >
                Mégse
              </button>
              <button
                className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                onClick={handleSaveNewRow}
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
