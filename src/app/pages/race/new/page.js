'use client';

import { useState, useEffect } from 'react';

export default function Page() {
  const [tracks, setTracks] = useState([]);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    trackId: '',
    date: '',
    name: '',
    isSprintEvent: false,
    round: '',
  });

  useEffect(() => {
    async function fetchTracks() {
      try {
        const res = await fetch('/api/tracks');
        const data = await res.json();
        setTracks(data);
      } catch (error) {
        console.error('Nem sikerült betölteni a pályákat:', error);
      }
    }
    fetchTracks();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/calendars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      console.log(res);
      if (res.ok) {
        alert('Verseny sikeresen mentve!');
        setFormData({
          year: new Date().getFullYear(),
          trackId: '',
          date: '',
          name: '',
          isSprintEvent: false,
          round: '',
        });
      } else {
        alert('Hiba történt a mentés közben.');
      }
    } catch (error) {
      console.error(error);
      alert('Nem sikerült elküldeni az adatokat.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4">
      <form
        className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg space-y-6"
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl font-bold text-center mb-6 tracking-wide text-gray-800">
          🏎️ Új F1 Verseny Felvétele
        </h2>

        {/* Év */}
        <div>
          <label className="block text-gray-600 font-semibold mb-1">Év</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
          />
        </div>

        {/* Dátum */}
        <div>
          <label className="block text-gray-600 font-semibold mb-1">Dátum</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
          />
        </div>

        {/* Verseny neve */}
        <div>
          <label className="block text-gray-600 font-semibold mb-1">Verseny neve</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Pl. Monacói Nagydíj"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
          />
        </div>

        {/* Futam sorszáma */}
        <div>
          <label className="block text-gray-600 font-semibold mb-1">Futam sorszáma</label>
          <input
            type="number"
            name="round"
            value={formData.round}
            onChange={handleChange}
            placeholder="Pl. 7"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
          />
        </div>

        {/* Sprint */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="isSprintEvent"
            checked={formData.isSprintEvent}
            onChange={handleChange}
            id="isSprintEvent"
            className="w-5 h-5 rounded-lg text-red-500 border-gray-300 focus:ring-2 focus:ring-red-500"
          />
          <label htmlFor="isSprintEvent" className="text-gray-700 font-medium">
            Sprint verseny
          </label>
        </div>

        {/* Track */}
        <div>
          <label className="block text-gray-600 font-semibold mb-1">Pálya</label>
          <select
            name="trackId"
            value={formData.trackId}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
          >
            <option value="">Válassz pályát...</option>
            {tracks.map((t) => (
              <option key={t._id} value={t._id}>
                {t.Name}
              </option>
            ))}
          </select>
        </div>

        {/* Mentés */}
        <div className="text-center">
          <button
            type="submit"
            className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-2xl shadow-lg transition-all transform hover:scale-105"
          >
            Mentés
          </button>
        </div>
      </form>
    </div>
  );
}
