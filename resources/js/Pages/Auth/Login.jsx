import { useState } from "react";
import Swal from "sweetalert2";
import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import AuthLayout from "@/Layouts/AuthLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { FaEnvelope, FaLock, FaArrowLeft, FaUserPlus, FaEye, FaEyeSlash } from "react-icons/fa"; // Import icons
import { motion } from "framer-motion"; // Import framer-motion

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false); // State untuk toggle password visibility
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), {
            onError: (errors) => {
                Swal.fire(
                    "Error",
                    "Login failed! Please check your credentials.",
                    "error"
                );
            },
            onFinish: () => reset("password"),
        });
    };

    return (
        <AuthLayout>
            <Head title="Masuk" />
            {status && Swal.fire("Info", status, "info")}

            <div className="flex flex-col md:flex-row items-center justify-center gap-0 w-full">
                {/* Banner Carousel */}
                <div className="w-full md:w-2/3 min-h-screen flex bg-gradient-to-r from-green-700 to-green-500">
                    <div
                        className="w-50 h-auto flex items-center"
                        style={{
                            backgroundImage: `url('/assets/images/KalBar.svg')`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    ></div>
                </div>

                {/* Form Login */}
                <div className="bg-white shadow-lg p-6 rounded-lg w-full md:w-1/3 min-h-screen flex flex-col items-center justify-center">
                    <motion.div
                        className="mb-2 text-center"
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-5xl font-extrabold text-gray-800">
                            Masuk
                        </h1>
                        <p className="text-sm text-gray-600">
                            Silahkan masukkan email dan password Anda untuk masuk
                            ke dalam sistem.
                        </p>
                    </motion.div>

                    <motion.form
                        onSubmit={submit}
                        className="w-full border-t pt-6"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        {/* Email Input */}
                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full pl-10"
                                    placeholder="Masukkan email Anda"
                                    autoComplete="username"
                                    isFocused={true}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                />
                            </div>
                            <InputError
                                message={errors.email}
                                className="mt-2"
                            />
                        </div>

                        {/* Password Input */}
                        <div className="mt-4">
                            <InputLabel htmlFor="password" value="Password" />
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <TextInput
                                    id="password"
                                    type={showPassword ? "text" : "password"} // Toggle type
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full pl-10 pr-10" // Padding untuk icon mata
                                    placeholder="Masukkan password Anda"
                                    autoComplete="current-password"
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)} // Toggle visibility
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Toggle icon */}
                                </button>
                            </div>
                            <InputError
                                message={errors.password}
                                className="mt-2"
                            />
                        </div>

                        {/* Remember Me Checkbox */}
                        <div className="mt-4 block">
                            <label className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData("remember", e.target.checked)
                                    }
                                />
                                <span className="ms-2 text-sm text-gray-600">
                                    Remember me
                                </span>
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 flex flex-col md:flex-row items-center justify-between w-full">
                            <motion.button
                                type="button"
                                onClick={() => window.history.back()}
                                className="text-sm text-gray-600 underline hover:text-gray-900 flex items-center"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaArrowLeft className="mr-2" />
                                Kembali
                            </motion.button>
                            <div className="flex gap-6 items-center">
                                {/* <Link
                                    href={route("register")}
                                    className="text-sm text-gray-600 underline hover:text-gray-900 flex items-center"
                                >
                                    <FaUserPlus className="mr-2" />
                                    Daftar
                                </Link> */}
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <PrimaryButton
                                        className="mt-2 md:mt-0 w-full md:w-auto"
                                        disabled={processing}
                                    >
                                        Masuk
                                    </PrimaryButton>
                                </motion.div>
                            </div>
                        </div>
                    </motion.form>
                </div>
            </div>
        </AuthLayout>
    );
}
