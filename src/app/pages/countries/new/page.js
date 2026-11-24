'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewCountryPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [continent, setContinent] = useState(0);
  const [flag, setFlag] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Name: name,
          Continent: continent === '' ? null : parseInt(continent, 10),
          Flag: flag,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'A mentés nem sikerült');
      }

      router.push('/pages/countries');
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
        <Link href="/pages/countries" style={{ color: '#4338ca', fontSize: '14px' }}>
          ← Vissza a listához
        </Link>
        <h1 className="text-2xl font-bold mt-4 mb-6">Új ország létrehozása</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Név</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Kontinens (szám)</span>
            <input
              type="number"
              step="1"
              min="0"
              value={continent}
              onChange={(e) => setContinent(e.target.value)}
              style={inputStyle}
              placeholder="pl. 1"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Zászló URL</span>
            <input
              type="url"
              value={flag}
              onChange={(e) => setFlag(e.target.value)}
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
            {saving ? 'Mentés...' : 'Ország mentése'}
          </button>
        </form>
      </div>
    </div>
  );
}
