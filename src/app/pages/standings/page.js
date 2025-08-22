'use client';

import { useState, useEffect, useRef } from 'react';

export default function Standings({ year }) {
  const [raceInfos, setRaceInfos] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [driverChecked, setDriverChecked] = useState({});
  const [teamsChecked, setTeamsChecked] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [intervalBottom, setIntervalBottom] = useState(1);
  const [intervalTop, setIntervalTop] = useState(1);
  const [calendars, setCalendars] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const chartRef = useRef(null);
  const comparisionRef = useRef(null);

  const columnName = ['Points', 'AVG Points', "Qualifying Results", 'Grid Position', 'Race Results', 'Time Differences', 'Compare Results'];
  const subColumnName = ['Q1', 'Q2', 'Q3'];

  return (
    <div>
    </div>
  );
}
