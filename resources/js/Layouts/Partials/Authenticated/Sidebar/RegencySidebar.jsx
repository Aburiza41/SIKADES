import { Link, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import {
    HiHome, // Untuk Beranda
    HiUsers, // Untuk Pejabat Desa dan Perangkat Desa
    HiUserGroup, // Untuk Organisasi
    HiAcademicCap, // Untuk Pelatihan
    HiCog, // Untuk Operator
} from "react-icons/hi";

export default function RegencySidebar(props) {
    const user = usePage().props.auth.user;
    const { url } = usePage(); // Mengambil URL saat ini untuk menentukan menu aktif

    const [positions, setPositions] = useState([]);

    // Fungsi untuk mengecek apakah menu aktif
    const isActive = (routeName) => {
        return url.startsWith(route(routeName));
    };

    useEffect(() => {
            const fetchPositions = async () => {
                try {
                    const response = await fetch("/position");
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const result = await response.json();

                    // Pastikan respons memiliki properti 'data' dan itu adalah array
                    if (result && Array.isArray(result.data)) {
                        setPositions(result.data); // Simpan array dari properti 'data'
                    } else {
                        console.error("API response does not contain a valid 'data' array:", result);
                    }
                } catch (error) {
                    console.error("Error fetching positions:", error);
                }
            };

            fetchPositions();
        }, []);

    return (
        <div>
            <ul className="space-y-3">
                {/* Menu Beranda */}
                <li>
                    <Link
                        href={route("regency.dashboard.index")}
                        className={
                            `flex items-center p-2 rounded transition-colors duration-700 font-bold `+
                            (route().current('regency.dashboard.*')
                                ? 'bg-green-700 text-white border-l-4 border-green-900 hover:bg-white hover:text-green-900 hover:border-none'
                                : 'text-green-900 hover:bg-green-700 hover:text-white')
                        }
                    >
                        <HiHome className="w-5 h-5 mr-3" />Beranda
                    </Link>
                </li>

                {/* Menu Pejabat Desa */}
                {/* <li>
                    <Link
                        href={route("regency.official.index")} // Ganti dengan route yang sesuai
                        className={
                            `flex items-center p-2 rounded transition-colors duration-700 font-bold `+
                            (route().current('regency.official.*')
                                ? 'bg-green-700 text-white border-l-4 border-green-900 hover:bg-white hover:text-green-900 hover:border-none'
                                : 'text-green-900 hover:bg-green-700 hover:text-white')
                        }
                    >
                        <HiUsers className="w-5 h-5 mr-3" />Pejabat
                    </Link>
                </li> */}

                {positions.length > 0 ? (
                    positions.map((position) => (
                        <li key={position.slug}>
                            <Link
                                href={"/regency/official/" + position.slug } // Ganti dengan route yang sesuai
                                className={
                                    `flex items-center p-2 rounded transition-colors duration-700 font-bold ` +
                                    (url.includes(`/admin/official/${position.slug}`)
                                        ? 'bg-green-700 text-white border-l-4 border-green-900 hover:bg-white hover:text-green-900 hover:border-none'
                                        : 'text-green-900 hover:bg-green-700 hover:text-white')
                                }
                            >
                                <HiUsers className="w-5 h-5 mr-3" />
                                <span className="max-w-[150px]">
                                {position.name}
                                </span>
                            </Link>
                        </li>
                    ))
                ) : (
                    <li>
                        <span className="flex items-center p-2 text-gray-500">
                            Memuat data pejabat...
                        </span>
                    </li>
                )}

                {/* Menu Perangkat Desa */}
                <li>
                    <Link
                        href={route("regency.aparatus.index")} // Ganti dengan route yang sesuai
                        className={
                            `flex items-center p-2 rounded transition-colors duration-700 font-bold `+
                            (route().current('regency.aparatus.*')
                                ? 'bg-green-700 text-white border-l-4 border-green-900 hover:bg-white hover:text-green-900 hover:border-none'
                                : 'text-green-900 hover:bg-green-700 hover:text-white')
                        }
                    >
                        <HiUsers className="w-5 h-5 mr-3" />Perangkat
                    </Link>
                </li>

                {/* Menu Organisasi */}
                {/* <li>
                    <Link
                        href={route("regency.organization.index")} // Ganti dengan route yang sesuai
                        className={
                            `flex items-center p-2 rounded transition-colors duration-700 font-bold `+
                            (route().current('regency.organization.*')
                                ? 'bg-green-700 text-white border-l-4 border-green-900 hover:bg-white hover:text-green-900 hover:border-none'
                                : 'text-green-900 hover:bg-green-700 hover:text-white')
                        }
                    >
                        <HiUserGroup className="w-5 h-5 mr-3" />Organisasi
                    </Link>
                </li> */}

                {/* Menu Pelatihan */}
                {/* <li>
                    <Link
                        href={route("regency.training.index")} // Ganti dengan route yang sesuai
                        className={
                            `flex items-center p-2 rounded transition-colors duration-700 font-bold `+
                            (route().current('regency.training.*')
                                ? 'bg-green-700 text-white border-l-4 border-green-900 hover:bg-white hover:text-green-900 hover:border-none'
                                : 'text-green-900 hover:bg-green-700 hover:text-white')
                        }
                    >
                        <HiAcademicCap className="w-5 h-5 mr-3" />Pelatihan
                    </Link>
                </li> */}

                {/* Menu Operator */}
                <li>
                    <Link
                        href={route("regency.user.index")} // Ganti dengan route yang sesuai
                        className={
                            `flex items-center p-2 rounded transition-colors duration-700 font-bold `+
                            (route().current('regency.user.*')
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
