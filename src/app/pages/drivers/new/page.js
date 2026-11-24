'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewDriverPage() {
  const router = useRouter();
  const [countries, setCountries] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [countryId, setCountryId] = useState('');
  const [born, setBorn] = useState('');
  const [racingNumber, setRacingNumber] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data) => setCountries(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          FirstName: firstName,
          LastName: lastName,
          CountryId: countryId,
          Born: born ? `${born}T00:00:00` : null,
          RacingNumber: racingNumber === '' ? null : parseInt(racingNumber, 10),
          Year: parseInt(year, 10),
          ImageUrl: imageUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'A mentés nem sikerült');
      }

      router.push('/pages/drivers');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '8px 12px',
  };

  return (
    <div className="font-sans min-h-screen p-8 sm:p-20">
      <div className="max-w-lg mx-auto">
        <Link href="/pages/drivers" style={{ color: '#4338ca', fontSize: '14px' }}>
          ← Vissza a listához
        </Link>
        <h1 className="text-2xl font-bold mt-4 mb-6">Új pilóta létrehozása</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Keresztnév</span>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={inputStyle}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Vezetéknév</span>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={inputStyle}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Ország</span>
            <select
              required
              value={countryId}
              onChange={(e) => setCountryId(e.target.value)}
              style={inputStyle}
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
            <span className="text-sm font-medium">Születési dátum</span>
            <input
              type="date"
              value={born}
              onChange={(e) => setBorn(e.target.value)}
              style={inputStyle}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Rajtszám</span>
            <input
              type="number"
              step="1"
              min="0"
              value={racingNumber}
              onChange={(e) => setRacingNumber(e.target.value)}
              style={inputStyle}
              placeholder="pl. 22"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Szezon (év)</span>
            <input
              type="number"
              step="1"
              required
              value={year}
              onChange={(e) => setYear(e.target.value)}
              style={inputStyle}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Kép URL (opcionális)</span>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              style={inputStyle}
              placeholder="https://..."
            />
          </label>

          {error && <p style={{ color: '#dc2626', fontSize: '14px' }}>{error}</p>}

          <button
            type="submit"
            disabled={saving}
            style={{
              backgroundColor: '#e0e7ff',
              color: '#4338ca',
              border: '1px solid #c7d2fe',
              borderRadius: '9999px',
              padding: '12px 24px',
              fontWeight: 600,
              opacity: saving ? 0.5 : 1,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Mentés...' : 'Pilóta mentése'}
          </button>
        </form>
      </div>
    </div>
  );
}
