// resources/js/Pages/Guest/Beranda/Partial/Section/NewsletterSection.jsx

export default function NewsletterSection() {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Berlangganan Newsletter</h2>
          <p className="mb-8 text-lg">
            Dapatkan update terbaru dan informasi seputar Raaf Palmchain.
          </p>
          <form className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <input
              type="email"
              placeholder="Masukkan email Anda"
              className="px-4 py-3 border rounded-md w-full sm:w-auto"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-md transition hover:bg-blue-700"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    );
  }
