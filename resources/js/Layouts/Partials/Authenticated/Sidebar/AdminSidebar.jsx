import { Link, usePage } from "@inertiajs/react";
import {
    HiHome, // Untuk Beranda
    HiUsers, // Untuk Pejabat Desa dan Perangkat Desa
    HiUserGroup, // Untuk Organisasi
    HiAcademicCap, // Untuk Pelatihan
    HiCog, // Untuk Operator
} from "react-icons/hi";

export default function AdminSidebar(props) {
    const { url } = usePage(); // Mengambil URL saat ini untuk menentukan menu aktif

    // Fungsi untuk mengecek apakah menu aktif
    const isActive = (routeName) => {
        return url.startsWith(route(routeName));
    };

    return (
        <div>
            <ul className="space-y-3">
                {/* Menu Beranda */}
                <li>
                    <Link
                        href={route("admin.dashboard.index")}
                        className={
                            `flex items-center p-2 rounded transition-colors duration-700 font-bold `+
                            (route().current('admin.dashboard.*')
                                ? 'bg-green-700 text-white border-l-4 border-green-900 hover:bg-white hover:text-green-900 hover:border-none'
                                : 'text-green-900 hover:bg-green-700 hover:text-white')
                        }
                    >
                        <HiHome className="w-5 h-5 mr-3" />Beranda
                    </Link>
                </li>

                {/* Menu Pejabat Desa */}
                <li>
                    <Link
                        href={route("admin.official.index")} // Ganti dengan route yang sesuai
                        className={
                            `flex items-center p-2 rounded transition-colors duration-700 font-bold `+
                            (route().current('admin.official.*')
                                ? 'bg-green-700 text-white border-l-4 border-green-900 hover:bg-white hover:text-green-900 hover:border-none'
                                : 'text-green-900 hover:bg-green-700 hover:text-white')
                        }
                    >
                        <HiUsers className="w-5 h-5 mr-3" />Pejabat
                    </Link>
                </li>

                {/* Menu Perangkat Desa */}
                <li>
                    <Link
                        href={route("admin.aparatus.index")} // Ganti dengan route yang sesuai
                        className={
                            `flex items-center p-2 rounded transition-colors duration-700 font-bold `+
                            (route().current('admin.aparatus.*')
                                ? 'bg-green-700 text-white border-l-4 border-green-900 hover:bg-white hover:text-green-900 hover:border-none'
                                : 'text-green-900 hover:bg-green-700 hover:text-white')
                        }
                    >
                        <HiUsers className="w-5 h-5 mr-3" />Perangkat
                    </Link>
                </li>

                {/* Menu Organisasi */}
                <li>
                    <Link
                        href={route("admin.organization.index")} // Ganti dengan route yang sesuai
                        className={
                            `flex items-center p-2 rounded transition-colors duration-700 font-bold `+
                            (route().current('admin.organization.*')
                                ? 'bg-green-700 text-white border-l-4 border-green-900 hover:bg-white hover:text-green-900 hover:border-none'
                                : 'text-green-900 hover:bg-green-700 hover:text-white')
                        }
                    >
                        <HiUserGroup className="w-5 h-5 mr-3" />Organisasi
                    </Link>
                </li>

                {/* Menu Pelatihan */}
                <li>
                    <Link
                        href={route("admin.training.index")} // Ganti dengan route yang sesuai
                        className={
                            `flex items-center p-2 rounded transition-colors duration-700 font-bold `+
                            (route().current('admin.training.*')
                                ? 'bg-green-700 text-white border-l-4 border-green-900 hover:bg-white hover:text-green-900 hover:border-none'
                                : 'text-green-900 hover:bg-green-700 hover:text-white')
                        }
                    >
                        <HiAcademicCap className="w-5 h-5 mr-3" />Pelatihan
                    </Link>
                </li>

                {/* Menu Operator */}
                <li>
                    <Link
                        href={route("admin.user.index")} // Ganti dengan route yang sesuai
                        className={
                            `flex items-center p-2 rounded transition-colors duration-700 font-bold `+
                            (route().current('admin.user.*')
                                ? 'bg-green-700 text-white border-l-4 border-green-900 hover:bg-white hover:text-green-900 hover:border-none'
                                : 'text-green-900 hover:bg-green-700 hover:text-white')
                        }
                    >
                        <HiCog className="w-5 h-5 mr-3" />Pengguna
                    </Link>
                </li>
            </ul>
        </div>
    );
}
