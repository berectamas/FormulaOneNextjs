import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <div className="container mx-auto mt-12 px-4">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="lg:w-1/2">
          <h1 className="text-5xl font-bold mb-4">Welcome to Formula One Statistics</h1>
          <p className="text-lg mb-6">
            Explore the latest statistics, trends, and insights from the world of Formula One racing.
          </p>
        </div>
        <div className="relative w-[600px] h-[300px] mb-3">
          <Image
            src="/f1car.jpg"
            alt="Formula One Car"
            className="w-full h-auto rounded-3xl"
            fill
            sizes="400px"
            priority
          />
        </div>
      </div>

      {/* Stats Overview Section */}
      <div className="mt-12 grid md:grid-cols-2 gap-8">
        {/* Race Calendar Card */}
        <div className="bg-white shadow-md rounded-xl p-6 text-center flex flex-col justify-between">
          <div>
            <h5 className="text-xl font-semibold mb-2">Race Calendar</h5>
            <p className="text-gray-600 mb-4">
              Check out the full schedule of upcoming and past Formula One races.
            </p>
          </div>
          <Link
            href={{
              pathname: `/pages/standings/${year}`,
            }}
            className="inline-block border border-blue-600 text-blue-600 px-5 py-2 rounded-lg hover:bg-blue-50 transition"
          >
            View Calendar
          </Link>
        </div>

        {/* Race Statistics Card */}
        <div className="bg-white shadow-md rounded-xl p-6 text-center flex flex-col justify-between">
          <div>
            <h5 className="text-xl font-semibold mb-2">Race Statistics</h5>
            <p className="text-gray-600 mb-4">
              Analyze detailed race statistics for the current Formula One season.
            </p>
          </div>
          <Link
            href={{
              pathname: "/pages/standings",
              query: { year: year.toString() },
            }}
            className="inline-block border border-blue-600 text-blue-600 px-5 py-2 rounded-lg hover:bg-blue-50 transition"
          >
            View Statistics
          </Link>
        </div>
      </div>
    </div>
  );
}
