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
    /*'AVG Points',
    'Qualifying Results',
    'Grid Position',
    'Race Results',
    'Time Differences',
    'Compare Results',*/
  ];
  const subColumnName = ['Q1', 'Q2', 'Q3'];
  const [raceInfos, setRaceInfos] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [driverChecked, setDriverChecked] = useState({});
  const [teamChecked, setTeamChecked] = useState({});
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
  function getTeamPointsTimeline(data, selectedTeams) {
    const racePoints = {
      0: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1], // főverseny
      4: [8, 7, 6, 5, 4, 3, 2, 1], // sprint
    };

    // Roundok kigyűjtése
    const rounds = [...new Set(data.map((r) => r.Calendar.Round))]
      .sort((a, b) => a - b)
      .filter((r) => (!roundMin || r >= roundMin) && (!roundMax || r <= roundMax));

    const teamTimeline = {};
    const teamTotals = {};

    selectedTeams.forEach((team) => {
      const teamId = team._id;
      teamTimeline[teamId] = [];
      teamTotals[teamId] = 0;
      rounds.forEach((round) => {
        // 1. Sprint először
        const sprintEntries = data.filter(
          (d) => d.TeamId === teamId && d.Calendar.Round === round && d.RaceEvent === 4,
        );
        let pts = sprintEntries.reduce(
          (sum, entry) => sum + (racePoints[4][entry.Position - 1] || 0),
          0,
        );
        if (sprintEntries.length > 0) {
          teamTotals[teamId] += pts;
          teamTimeline[teamId].push(teamTotals[teamId]);
        }

        // 2. Főverseny
        pts = 0;
        const mainEntries = data.filter(
          (d) => d.TeamId === teamId && d.Calendar.Round === round && d.RaceEvent === 0,
        );
        mainEntries.forEach((entry) => {
          // Pozíció alapján kapott pontok
          pts += racePoints[0][entry.Position - 1] || 0;

          // Gyors kör bónusz
          if (entry.IsFastestLapOnTheRace && entry.Position <= 10 && year > 2019 && year < 2025) {
            pts += 1;
          }
        });

        if (mainEntries.length > 0) {
          // Csapat összesített pontjai
          teamTotals[teamId] += pts;

          // Csapat pontok idővonala
          teamTimeline[teamId].push(teamTotals[teamId]);
        }
        if (mainEntries.length == 0 && sprintEntries.length == 0) {
          teamTimeline[teamId].push(-1);
        }
        // Ha egyik sem volt, -1
      });
    });
    return teamTimeline;
  }
  function lightenColor(hex, percent) {
    // hex: '#ff8000', percent: 0.2 = 20% világosítás
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, ((num >> 16) & 0xff) + 255 * percent);
    const g = Math.min(255, ((num >> 8) & 0xff) + 255 * percent);
    const b = Math.min(255, (num & 0xff) + 255 * percent);
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  }
  const handleDriverCheckedChange = (driverId) => {
    setDriverChecked((prev) => ({
      ...prev,
      [driverId]: !prev[driverId],
    }));
  };

  const handleTeamCheckedChange = (teamId) => {
    setTeamChecked((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
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
  const selectedTeamIds = useMemo(() => {
    return Object.entries(teamChecked)
      .filter(([id, checked]) => checked)
      .map(([id]) => id);
  }, [teamChecked]);

  const selectedTeams = useMemo(
    () => teams.filter((d) => selectedTeamIds.includes(d._id)),
    [teams, selectedTeamIds],
  );
  // Összes versenyző pontjainak kiszámítása
  const pointsDictDrivers = useMemo(() => {
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

  const pointsDictTeams = useMemo(() => {
    return getTeamPointsTimeline(
      raceInfos.filter(
        (r) =>
          (r.RaceEvent === 0 || r.RaceEvent === 4) &&
          r.Calendar.Round >= Number(roundMin) &&
          r.Calendar.Round <= Number(roundMax),
      ),
      teams,
    );
  }, [raceInfos, teams, roundMin, roundMax]);

  // Összpontok kiszámítása a pointsDict alapján
  const driverStandings = useMemo(() => {
    return drivers
      .map((driver) => {
        const timeline = pointsDictDrivers[driver._id] || [];
        const totalPoints =
          timeline.length > 0 && timeline[timeline.length - 1] > 0
            ? timeline[timeline.length - 1]
            : 0;

        // Helyezések számolása
        const positionCounts = {}; // pl. {1: 3, 2: 2, 3: 1, ...}
        raceInfos.forEach((r) => {
          if (r.DriverId === driver._id && r.RaceEvent === 0) {
            const pos = r.Position;
            if (pos) {
              positionCounts[pos] = (positionCounts[pos] || 0) + 1;
            }
          }
        });

        return {
          id: driver._id,
          firstName: driver.FirstName,
          lastName: driver.LastName,
          teamId: driver.TeamId,
          points: totalPoints,
          positionCounts, // hozzáadjuk a pozíciók számát
        };
      })
      .sort((a, b) => {
        // Első: pontok
        if (b.points !== a.points) return b.points - a.points;

        // Második: győzelmek, harmadik: 2. hely, negyedik: 3. hely stb.
        const maxPosition = Math.max(
          ...Object.keys(a.positionCounts).map(Number),
          ...Object.keys(b.positionCounts).map(Number),
        );

        for (let i = 1; i <= maxPosition; i++) {
          const aCount = a.positionCounts[i] || 0;
          const bCount = b.positionCounts[i] || 0;
          if (bCount !== aCount) return bCount - aCount;
        }

        return 0; // ha teljesen egyenlő
      });
  }, [drivers, raceInfos, pointsDictDrivers]);

  const teamStandings = useMemo(() => {
    return teams
      .map((team) => {
        const timeline = pointsDictTeams[team._id] || [];
        const totalPoints =
          timeline.length > 0 && timeline[timeline.length - 1] > 0
            ? timeline[timeline.length - 1]
            : 0;

        // Helyezések számolása a csapat versenyzői alapján
        const positionCounts = {}; // {1: X, 2: Y, 3: Z, ...}
        raceInfos.forEach((r) => {
          if (r.TeamId === team._id && r.RaceEvent === 0) {
            const pos = r.Position;
            if (pos) {
              positionCounts[pos] = (positionCounts[pos] || 0) + 1;
            }
          }
        });

        return {
          id: team._id,
          firstName: team.Name,
          lastName: '',
          points: totalPoints,
          positionCounts, // csapat összesített helyezések
        };
      })
      .sort((a, b) => {
        // Első: pontok
        if (b.points !== a.points) return b.points - a.points;

        // Második: 1. helyek, majd 2., 3., ...
        const maxPosition = Math.max(
          ...Object.keys(a.positionCounts).map(Number),
          ...Object.keys(b.positionCounts).map(Number),
        );

        for (let i = 1; i <= maxPosition; i++) {
          const aCount = a.positionCounts[i] || 0;
          const bCount = b.positionCounts[i] || 0;
          if (bCount !== aCount) return bCount - aCount;
        }

        return 0; // teljesen egyenlő
      });
  }, [teams, raceInfos, pointsDictTeams]);

  const filteredCalendar = useMemo(() => {
    return calendar.filter((c) => c.Round >= Number(roundMin) && c.Round <= Number(roundMax));
  }, [calendar, roundMin, roundMax]);

  function getChartData(pointsDictDrivers, pointsDictTeams) {
    const driverData = selectedDrivers.map((driver) => {
      const driverName = driver.FirstName + ' ' + driver.LastName;
      const pointsArray = pointsDictDrivers[driver._id] || [];
      const baseColor =
        raceInfos
          .find(
            (r) =>
              r.CalendarId === filteredCalendar[filteredCalendar.length - 1]._id &&
              r.DriverId === driver._id &&
              r.RaceEvent === 0,
          )
          ?.Team?.Years?.find((y) => y.Year === Number(year))?.Color ||
        raceInfos
          .find((r) => r.DriverId === driver._id && r.RaceEvent === 0)
          ?.Team?.Years?.find((y) => y.Year === Number(year))?.Color ||
        '#000'; // alapértelmezett fekete, ha egyik sem található

      const driverIndex = selectedDrivers.findIndex((d) => d._id === driver._id) + 1;
      console.log(driverIndex);
      const driverColor = lightenColor(baseColor, driverIndex * 0.03); // 15% árnyalatkülönbség
      return {
        type: 'line',
        name: driverName,
        color: driverColor,
        markerColor: driverColor,
        lineColor: driverColor,
        showInLegend: true,
        dataPoints: pointsArray.map((points, index) => ({
          label: filteredCalendar[index]?.Name || `Race ${index + 1}`,
          y: points >= 0 ? points : null,
        })),
      };
    });

    const teamData = selectedTeams.map((team) => {
      const teamName = team.Name;
      const pointsArray = pointsDictTeams[team._id] || [];
      const teamColor =
        raceInfos
          .find(
            (r) =>
              r.CalendarId === filteredCalendar[filteredCalendar.length - 1]._id &&
              r.TeamId === team._id &&
              r.RaceEvent === 0,
          )
          ?.Team?.Years?.find((y) => y.Year === Number(year))?.Color || '#000';
      return {
        type: 'line',
        name: teamName,
        color: teamColor,
        markerColor: teamColor,
        lineColor: teamColor,
        showInLegend: true,
        dataPoints: pointsArray.map((points, index) => ({
          label: filteredCalendar[index]?.Name || `Race ${index + 1}`,
          y: points >= 0 ? points : null,
        })),
      };
    });

    return [...driverData, ...teamData];
  }

  const findById = (id) => {
    const driverEntity = drivers.find((driver) => driver._id === id);
    const teamEntity = teams.find((team) => team._id === id);

    return isDriver(driverEntity) ? driverEntity : teamEntity;
  };

  function isDriver(entity) {
    return entity && entity.FirstName !== undefined && entity.LastName !== undefined;
  }

  return (
    <div className="w-full min-h-screen p-4 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Race Dashboard</h1>

      <div className="grid grid-cols-12 gap-4">
        {/* Bal oldali táblázat */}
        <div className="col-span-3 border rounded p-4 bg-white shadow h-fit">
          <StandingTable
            standings={driverStandings}
            checked={driverChecked}
            findById={findById}
            isDriver={isDriver}
            onCheckedChange={handleDriverCheckedChange}
            columnName="Points"
          />
        </div>
        <div className="col-span-3 border rounded p-4 bg-white shadow h-fit">
          <StandingTable
            standings={teamStandings}
            checked={teamChecked}
            findById={findById}
            isDriver={isDriver}
            onCheckedChange={handleTeamCheckedChange}
            columnName="Points"
          />
        </div>

        {/* Jobb oldali tartalom */}
        <div className="col-span-6">
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
              <MultilineChart
                data={getChartData(pointsDictDrivers, pointsDictTeams)}
                height={512}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
