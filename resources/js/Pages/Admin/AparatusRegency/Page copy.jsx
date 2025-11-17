import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import AparatusList from "@/Pages/Regency/Aparatus/Partials/Component/AparatusList";

export default function Aparatus({ districts }) {
    // console.log(districts);
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Perangkat Desa</h2>}>
            <Head title="Perangkat Desa" />

            <div className="p-5">
                <AparatusList aparatus={districts} />
            </div>
        </AuthenticatedLayout>
    );
}
