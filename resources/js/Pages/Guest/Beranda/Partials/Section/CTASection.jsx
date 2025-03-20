// resources/js/Pages/Guest/Beranda/Partial/Section/CTASection.jsx

import { Link } from '@inertiajs/react';

export default function CTASection() {
  return (
    <section className="py-16 bg-blue-600 text-white text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold">Siap Memulai?</h2>
        <p className="mt-4 text-lg">
          Daftar sekarang dan optimalkan manajemen pengumpulan buah sawit Anda dengan Raaf Palmchain.
        </p>
        <Link
          href="/register"
          className="mt-6 inline-block bg-white text-blue-600 px-6 py-3 rounded-full transition hover:bg-gray-200"
        >
          Daftar Sekarang
        </Link>
      </div>
    </section>
  );
}
