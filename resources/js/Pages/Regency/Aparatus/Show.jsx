import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import ShowList from "./Partials/Component/ShowList";

export default function Aparatus({ villages }) {
    // console.log(villages);
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Perangkat Desa</h2>}>
            <Head title="Perangkat Desa" />

            <div className="p-5">
                <ShowList villages={villages} />
            </div>
        </AuthenticatedLayout>
    );
}
