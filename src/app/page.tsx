import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold text-green-700 mb-4">Bloom</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
        Upload a photo of your bouquet and get personalized care tips to help
        your flowers last longer.
      </p>
      <Link
        href="/login"
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        Get Started
      </Link>
    </main>
  );
}