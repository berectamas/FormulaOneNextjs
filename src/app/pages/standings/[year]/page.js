// app/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MultilineChart from '../../../components/charts/multilineChart';
import StandingTable from '../../../components/standing-table/standing-table';
import { useMemo } from 'react';

export default function Dashboard() {
  const { year } = useParams();
  const columnName = [
    'Points',
    'AVG Points',
    'Qualifying Results',
    'Grid Position',
    'Race Results',
    'Time Differences',
    'Compare Results',
  ];
  const subColumnName = ['Q1', 'Q2', 'Q3'];
  const [raceInfos, setRaceInfos] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [driverChecked, setDriverChecked] = useState({});
  const [roundMin, setRoundMin] = useState(0);
  const [roundMax, setRoundMax] = useState(0);

  // Csak a Qualifying Results és Time Differences esetén lesz sub-tab
  const hasSubTabs =
    columnName[activeTab] === 'Qualifying Results' || columnName[activeTab] === 'Time Differences';

  const handleTabClick = (index) => {
    setActiveTab(index);
    setActiveSubTab(0); // sub-tabot reseteljük
  };

  useEffect(() => {
    async function fetchRace() {
      try {
        const res = await fetch(`/api/races/year/${year}`);
        const data = await res.json();
        const raceData = Array.isArray(data) ? data : [data];

        setRaceInfos(raceData);

        const maxRound = raceData.length ? Math.max(...raceData.map((r) => r.Calendar.Round)) : 0;
        setRoundMax(maxRound);

        // Alapértelmezett roundMin
        setRoundMin(1);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchRace();
  }, [year]);

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
    async function fetchRace() {
      try {
        const res = await fetch(`/api/calendars/?year=${year}`);
        const data = await res.json();
        const baseCalendar = Array.isArray(data) ? data : [data];

        // Kiterjesztett calendar létrehozása
        const extendedCalendar = [];
        baseCalendar.forEach((item) => {
          if (item.IsSprintEvent) {
            // Sprint előtti entry
            extendedCalendar.push({
              ...item,
              Name: `${item.Name} Sprint`,
              IsSprintEvent: false, // opcionális, hogy ne keveredjen az eredetivel
              SprintPlaceholder: true, // jelölés, ha kell
            });
          }
          extendedCalendar.push(item); // eredeti item
        });

        setCalendar(extendedCalendar);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchRace();
  }, [year]);

  function getDriverPointsTimeline(data, selectedDrivers) {
    const racePoints = {
      0: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1], // főverseny
      4: [8, 7, 6, 5, 4, 3, 2, 1], // sprint
    };

    // Roundok kigyűjtése
    const rounds = [...new Set(data.map((r) => r.Calendar.Round))]
      .sort((a, b) => a - b)
      .filter((r) => (!roundMin || r >= roundMin) && (!roundMax || r <= roundMax));

    const driverTimeline = {};
    const driverTotals = {};

    selectedDrivers.forEach((driver) => {
      const driverId = driver._id;
      driverTimeline[driverId] = [];
      driverTotals[driverId] = 0;

      rounds.forEach((round) => {
        // 1. Sprint először
        const sprintEntry = data.find(
          (d) => d.DriverId === driverId && d.Calendar.Round === round && d.RaceEvent === 4,
        );
        if (sprintEntry) {
          const pos = sprintEntry.Position;
          const pts = racePoints[4][pos - 1] || 0;
          driverTotals[driverId] += pts;
          driverTimeline[driverId].push(driverTotals[driverId]);
        }

        // 2. Főverseny
        const mainEntry = data.find(
          (d) => d.DriverId === driverId && d.Calendar.Round === round && d.RaceEvent === 0,
        );
        if (mainEntry) {
          let points = racePoints[0][mainEntry.Position - 1] || 0;
          // Gyors kör
          if (
            mainEntry.IsFastestLapOnTheRace &&
            mainEntry.Position <= 10 &&
            year > 2019 &&
            year < 2025
          ) {
            points += 1;
          }
          driverTotals[driverId] += points;
          driverTimeline[driverId].push(driverTotals[driverId]);
        }

        // Ha egyik sem volt, -1
        if (!sprintEntry && !mainEntry) {
          driverTimeline[driverId].push(-1);
        }
      });
    });

    return driverTimeline;
  }
  const handleDriverCheckedChange = (driverId) => {
    setDriverChecked((prev) => ({
      ...prev,
      [driverId]: !prev[driverId],
    }));
  };

  const selectedDriverIds = useMemo(() => {
    return Object.entries(driverChecked)
      .filter(([id, checked]) => checked)
      .map(([id]) => id);
  }, [driverChecked]);

  const selectedDrivers = useMemo(
    () => drivers.filter((d) => selectedDriverIds.includes(d._id)),
    [drivers, selectedDriverIds],
  );

  // Összes versenyző pontjainak kiszámítása
  const pointsDict = useMemo(() => {
    return getDriverPointsTimeline(
      raceInfos.filter(
        (r) =>
          (r.RaceEvent === 0 || r.RaceEvent === 4) &&
          r.Calendar.Round >= Number(roundMin) &&
          r.Calendar.Round <= Number(roundMax),
      ),
      drivers,
    );
  }, [raceInfos, drivers, roundMin, roundMax]);

  // Összpontok kiszámítása a pointsDict alapján
  const standings = useMemo(() => {
    return drivers
      .map((driver) => {
        const timeline = pointsDict[driver._id] || [];
        const totalPoints =
          timeline.length > 0 && timeline[timeline.length - 1] > 0
            ? timeline[timeline.length - 1]
            : 0;
        return {
          id: driver._id,
          firstName: driver.FirstName,
          lastName: driver.LastName,
          points: totalPoints,
        };
      })
      .sort((a, b) => b.points - a.points); // csökkenő sorrend
  }, [drivers, pointsDict]);
  const filteredCalendar = useMemo(() => {
    return calendar.filter((c) => c.Round >= Number(roundMin) && c.Round <= Number(roundMax));
  }, [calendar, roundMin, roundMax]);

  function getChartData(pointsDict) {
    return selectedDrivers.map((driver) => {
      const driverName = driver.FirstName + ' ' + driver.LastName;
      const pointsArray = pointsDict[driver._id] || [];
      return {
        type: 'line',
        name: driverName,
        showInLegend: true,
        dataPoints: pointsArray.map((points, index) => ({
          label: filteredCalendar[index]?.Name || `Race ${index + 1}`,
          y: points >= 0 ? points : null,
        })),
      };
    });
  }
  const findById = (id) => {
    return drivers.find((driver) => driver._id === id);
  };

  function isDriver(entity) {
    return entity && entity.FirstName !== undefined && entity.LastName !== undefined;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Race Dashboard</h1>

      <div className="grid grid-cols-12 gap-4">
        {/* Bal oldali táblázat */}
        <div className="col-span-4 border rounded p-4 bg-white shadow h-fit">
          <h2 className="text-lg font-semibold mb-2">Választó lista</h2>
          <StandingTable
            standings={standings}
            driverChecked={driverChecked}
            findById={findById}
            isDriver={isDriver}
            onDriverCheckedChange={handleDriverCheckedChange}
          />
        </div>

        {/* Jobb oldali tartalom */}
        <div className="col-span-8">
          {/* Fő tabok */}
          <ul className="flex border-b mb-4">
            {columnName.map((name, index) => (
              <li key={index} className="-mb-px mr-2">
                <button
                  className={`px-4 py-2 font-semibold border rounded-t-lg ${
                    activeTab === index ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => handleTabClick(index)}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4 mb-4 ml-1">
            <label className="text-gray-700">
              From:
              <input
                type="number"
                value={roundMin}
                onChange={(e) => setRoundMin(Number(e.target.value))}
                className="ml-2 border rounded px-2 py-1 w-20"
                min={1}
                max={calendar.length > 0 ? Math.max(...calendar.map((c) => c.Round)) : undefined}
              />
              Round
            </label>

            <label className="text-gray-700">
              To:
              <input
                type="number"
                value={roundMax}
                onChange={(e) => setRoundMax(Number(e.target.value))}
                className="ml-2 border rounded px-2 py-1 w-20"
                min={1}
                max={calendar.length > 0 ? Math.max(...calendar.map((c) => c.Round)) : undefined}
              />
              Round
            </label>
          </div>

          {/* Sub-tabs */}
          {hasSubTabs && (
            <ul className="flex border-b mb-4 ml-4">
              {subColumnName.map((subName, index) => (
                <li key={index} className="-mb-px mr-2">
                  <button
                    className={`px-3 py-1 font-medium border rounded-t-lg ${
                      activeSubTab === index
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                    onClick={() => setActiveSubTab(index)}
                  >
                    {subName}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Chart placeholder */}
          <div className="border p-6 rounded shadow bg-white">
            <p className="text-gray-700">
              Selected Tab: <strong>{columnName[activeTab]}</strong>
            </p>
            {hasSubTabs && (
              <p className="text-gray-700">
                Selected SubTab: <strong>{subColumnName[activeSubTab]}</strong>
              </p>
            )}
            <div className="mt-4 h-128 w-full bg-gray-100 flex items-center justify-center">
              <MultilineChart data={getChartData(pointsDict)} height={512} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
