// resources/js/Pages/Guest/Beranda/Partial/Section/ScreenshotSection.jsx

export default function ScreenshotSection({ handleImageError }) {
    return (
      <section className="py-16 bg-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Tampilan Sistem</h2>
          <div id="screenshot-container" className="flex justify-center">
            <img
              src="https://via.placeholder.com/800x400"
              alt="Tampilan Sistem"
              onError={handleImageError}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>
    );
  }
