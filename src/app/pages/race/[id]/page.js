"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

export default function RacePage() {
  const { id } = useParams();
  const [raceInfos, setRaceInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const raceEventTypes = [
    { label: "Race", value: 0 },
    { label: "Q1", value: 1 },
    { label: "Q2", value: 2 },
    { label: "Q3", value: 3 },
    { label: "Sprint", value: 4 },
    { label: "SQ1", value: 5 },
    { label: "SQ2", value: 6 },
    { label: "SQ3", value: 7 },
  ];
  

  const f1CurrentSprintPoints = [8,7,6,5,4,3,2,1]
  const f1CurrentRacePoints = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
  const f1CurrentPoints = [f1CurrentRacePoints,f1CurrentSprintPoints]
  useEffect(() => {
    async function fetchRace() {
      try {
        const res = await fetch(`/api/races/${id}`);
        const data = await res.json();
        setRaceInfos(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("Fetch error:", error);
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
    (info) => info.RaceEvent === raceEventTypes[activeTab].value
  );

  const formatTime = (info) => {
    if (!info || info.Hours === undefined) return null;

    const h = info.Hours ? String(info.Hours).padStart(2, "0") : null;
    const m = info.Minutes ? String(info.Minutes).padStart(2, "0") : null;
    const s = info.Seconds ? String(info.Seconds).padStart(2, "0") : null;
    const ms = info.Miliseconds ? String(info.Miliseconds).padStart(3, "0") : null;

    let timeStr = "";

    if (h) timeStr += `${h}:`;
    if (m) timeStr += `${m}:`;
    if (s) timeStr += s;
    if (ms) timeStr += timeStr ? `.${ms}` : `${ms}`;

    return timeStr || "0";
  };


const getTimeDisplay = (info, first, firstInfo) => {
  // Ellenőrizzük a FinishingStatus-t
  if (info.FinishingStatus === 1) return "DNF";
  if (info.FinishingStatus === 2) return "DSQ";
  if (info.FinishingStatus === 3) return "DNS";

  const isZeroTime =
    info.Hours === 0 &&
    info.Minutes === 0 &&
    info.Seconds === 0 &&
    info.Miliseconds === 0;

  if (first) {
    return isZeroTime ? "-" : formatTime(info);
  }

  if (!isZeroTime && firstInfo) {
    // Delta az elsőhöz képest a tabon belül
    const msInfo =
      info.Hours * 3600000 +
      info.Minutes * 60000 +
      info.Seconds * 1000 +
      info.Miliseconds;

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
      return `+${dH}:${String(dM).padStart(2, "0")}:${String(dS).padStart(
        2,
        "0"
      )}.${String(dMS).padStart(3, "0")}`;
    } else if (dM > 0) {
      return `+${dM}:${String(dS).padStart(2, "0")}.${String(dMS).padStart(
        3,
        "0"
      )}`;
    } else if (dS > 0) {
      return `+${dS}.${String(dMS).padStart(3, "0")}`;
    } else {
      return `+0.${String(dMS).padStart(3, "0")}`;
    }
  }

  // Ha 00:00:00.000, nézzük a teljesített köröket
  if (firstInfo) {
    const lapsBehind = firstInfo.LapsCompleted - info.LapsCompleted;
    if (lapsBehind > 0) return `+${lapsBehind} lap${lapsBehind > 1 ? "s" : ""}`;
  }
  return "-";
};



  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">
        {raceInfos[0].Calendar?.Name} - {raceInfos[0].Calendar?.Year}
      </h1>

      {/* Tab gombok */}
      <div className="flex space-x-2 mb-4">
        {raceEventTypes.map((tab, idx) => (
          <button
            key={tab.value}
            className={`px-4 py-2 rounded ${
              activeTab === idx
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
{/* Fejléc */}
  <div className="flex px-3 py-2 border-b font-bold text-gray-700">
    <div className="w-[60px]">Pos</div>
    <div className="w-[60px]"></div> {/* driver kép helye */}
    <div className="flex-1">Driver / Team</div>
    {filteredRaceInfos.some(info => info.RaceEvent % 4 === 0) ? (
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
            style={{ objectFit: "contain" }}
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
          <div className="w-[80px] text-center font-bold text-lg">
            {info.LapsCompleted}
          </div>
        )}


      <div className="w-[100px] text-right">
        <div className="w-[100px] text-right">
          {info.RaceEvent % 4 === 0? (
            <p className="font-bold text-lg">
              + {f1CurrentPoints[info.RaceEvent / 4][info.Position - 1]??0}
            </p>
          ) : (
            <p className="font-bold text-lg">
              {formatTime(info)}
            </p>
          )}
        </div>
        <p className="font-bold text-lg">
           {idx===0?formatTime(info):getTimeDisplay(info, idx === 0, filteredRaceInfos[0])}
        </p>
        <p className="text-sm text-gray-600">
              {formatTime(info)}
        </p>
      </div>
    </div>
  ))}
</div>

    </div>
  );
}
