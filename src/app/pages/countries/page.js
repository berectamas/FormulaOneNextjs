"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  //const _year = searchParams.get("year");

  const [countries, setCountries] = useState([]);

  useEffect(() => {
    //if (!_id) return;

    fetch(`/api/countries`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setCountries(data); // ha az API tömböt ad vissza
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <div className="font-sans min-h-screen p-8 sm:p-20">
      <main className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {countries.map((country, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-xl p-4 flex flex-col items-center justify-center hover:shadow-lg transition"
          >
          <Image
            src={country.Flag || "/next.svg"}
            alt={country.Name || "Country"}
            width={120}
            height={80}
            className="rounded-md mb-3"
          />
          <h2 className="text-lg font-semibold">{country.Name}</h2>
          <p className="text-gray-600 text-sm">{country.Region}</p>

          </div>
        ))}
      </main>
    </div>
  );
}
