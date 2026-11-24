'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Page() {
  //const _year = searchParams.get("year");

  const [countries, setCountries] = useState([]);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    //if (!_id) return;

    fetch(`/api/countries`)
      .then((res) => res.json())
      .then((data) => {
        setCountries(data); // ha az API tömböt ad vissza
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <div className="font-sans min-h-screen p-8 sm:p-20">
      <Link
        href="/pages/countries/new"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 24px',
          marginBottom: '24px',
          borderRadius: '9999px',
          backgroundColor: hover ? '#c7d2fe' : '#e0e7ff',
          color: '#4338ca',
          fontSize: '14px',
          fontWeight: 600,
          textDecoration: 'none',
          border: '1px solid #c7d2fe',
          boxShadow: hover
            ? '0 8px 16px rgba(129, 140, 248, 0.3)'
            : '0 2px 6px rgba(129, 140, 248, 0.2)',
          transform: hover ? 'translateY(-2px)' : 'translateY(0)',
          transition: 'all 0.2s ease',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: 'transform 0.2s ease',
            transform: hover ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Új ország
      </Link>
      <main className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {countries.map((country, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-xl p-4 flex flex-col items-center justify-center hover:shadow-lg transition"
          >
            <div className="relative w-[120px] h-[80px] mb-3">
              <Image
                src={country.Flag || '/f1.png'}
                alt={country.Name || 'Country'}
                fill
                style={{ objectFit: 'contain' }}
                className="rounded-md"
                sizes="120px"
                priority={true} // mert above-the-fold és LCP
              />
            </div>
            <h2 className="text-lg font-semibold">{country.Name}</h2>
            <p className="text-gray-600 text-sm">{country.Region}</p>
          </div>
        ))}
      </main>
    </div>
  );
}
