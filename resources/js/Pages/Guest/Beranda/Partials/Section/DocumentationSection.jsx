// resources/js/Pages/Guest/Beranda/Partial/Section/DocumentationSection.jsx

import { Link } from '@inertiajs/react';

export default function DocumentationSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Dokumentasi</h2>
        <p className="text-center mb-8 text-lg">
          Temukan panduan dan dokumentasi lengkap untuk memaksimalkan penggunaan Raaf Palmchain.
        </p>
        <div className="text-center">
          <Link
            href="https://example.com/documentation"
            className="px-6 py-3 bg-blue-600 text-white rounded-full transition hover:bg-blue-700"
          >
            Baca Dokumentasi
          </Link>
        </div>
      </div>
    </section>
  );
}
