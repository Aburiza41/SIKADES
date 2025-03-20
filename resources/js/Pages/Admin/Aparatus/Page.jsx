import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import AparatusList from "@/Pages/Admin/Aparatus/Partials/Component/AparatusList";

export default function Aparatus({ regencies }) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Perangkat Desa</h2>}>
            <Head title="Perangkat Desa" />

            <div className="p-5">
                <AparatusList aparatus={regencies} />
            </div>
        </AuthenticatedLayout>
    );
}
