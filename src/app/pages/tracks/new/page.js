'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewTrackPage() {
  const router = useRouter();
  const [countries, setCountries] = useState([]);
  const [name, setName] = useState('');
  const [countryId, setCountryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/countries')
      .then((res) => res.json())
      .then(setCountries)
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Name: name,
          CountryId: countryId,
          ImageUrl: imageUrl,
        }),
      });

      if (!res.ok) throw new Error('A mentés nem sikerült');

      router.push('/'); // vissza a listához
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="font-sans min-h-screen p-8 sm:p-20">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          ← Vissza a listához
        </Link>
        <h1 className="text-2xl font-bold mt-4 mb-6">Új track létrehozása</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Név</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Ország</span>
            <select
              required
              value={countryId}
              onChange={(e) => setCountryId(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">Válassz országot...</option>
              {countries.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.Name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Kép URL (opcionális)</span>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="border rounded-lg px-3 py-2"
              placeholder="https://..."
            />
          </label>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {saving ? 'Mentés...' : 'Track mentése'}
          </button>
        </form>
      </div>
    </div>
  );
}
