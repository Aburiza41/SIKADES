import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

// Variants untuk animasi
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-green-900 to-green-800 border-t border-green-700">
      <div className="mx-auto max-w-7xl py-12">
        {/* Grid untuk konten footer dengan animasi */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Bagian 1: Tentang SIKADES */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Tentang SIKADES</h3>
            <p className="text-sm text-gray-300">
              SIKADES adalah Sistem Informasi Kumpulan Data Aparatur Desa yang dirancang untuk memudahkan pengelolaan data aparatur desa, meningkatkan transparansi, dan mendukung pembangunan desa yang berkelanjutan.
            </p>
          </motion.div>

          {/* Bagian 2: Tautan Cepat */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Tautan Cepat</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-300 hover:text-green-400 transition-colors duration-200"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-300 hover:text-green-400 transition-colors duration-200"
                >
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-300 hover:text-green-400 transition-colors duration-200"
                >
                  Fitur
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-300 hover:text-green-400 transition-colors duration-200"
                >
                  Kontak
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Bagian 3: Kontak */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Kontak Kami</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-sm text-gray-300">
                <FaEnvelope className="w-4 h-4" />
                <span>support@sikades.com</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-gray-300">
                <FaPhone className="w-4 h-4" />
                <span>+62 123 4567 890</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-gray-300">
                <FaMapMarkerAlt className="w-4 h-4" />
                <span>Jl. Desa Maju No. 123, Indonesia</span>
              </li>
            </ul>
          </motion.div>

          {/* Bagian 4: Sosial Media */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Ikuti Kami</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-300 hover:text-green-400 transition-colors duration-200"
              >
                <FaFacebook className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-green-400 transition-colors duration-200"
              >
                <FaTwitter className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-green-400 transition-colors duration-200"
              >
                <FaInstagram className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-green-400 transition-colors duration-200"
              >
                <FaLinkedin className="w-6 h-6" />
              </a>
            </div>
          </motion.div>
        </motion.div>

        {/* Bagian Hak Cipta */}
        <motion.div
          className="border-t border-green-700 pt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-300">
              &copy; {new Date().getFullYear()} SIKADES. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-2 sm:mt-0">
              <Link
                href="#"
                className="text-sm text-gray-300 hover:text-green-400 transition-colors duration-200"
              >
                Kebijakan Privasi
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-300 hover:text-green-400 transition-colors duration-200"
              >
                Syarat & Ketentuan
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
