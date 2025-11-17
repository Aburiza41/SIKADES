import jsPDF from "jspdf";
import "jspdf-autotable";

const PDF = (data) => {
    const doc = new jsPDF();

    // Check if it's a single official or page report
    if (data.nama_lengkap) {
        // Single official PDF
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Detail Pejabat", 105, 15, { align: "center" });

        doc.setLineWidth(0.5);
        doc.line(14, 18, 196, 18);

        const date = new Date().toLocaleDateString("id-ID");
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text(`Dicetak pada: ${date}`, 14, 25);

        doc.autoTable({
            startY: 30,
            head: [["Field", "Value"]],
            body: [
                ["NIK", data.nik || "-"],
                ["NIAD", data.niad || "-"],
                ["Nama Lengkap", data.nama_lengkap || "-"],
                ["Tempat Lahir", data.tempat_lahir || "-"],
                ["Tanggal Lahir", data.tanggal_lahir || "-"],
                ["Jenis Kelamin", data.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"],
                ["Status Perkawinan", data.status_perkawinan || "-"],
                ["Agama", data.agama || "-"],
                ["Alamat", data.alamat || "-"],
                ["Handphone", data.handphone || "-"],
                ["Golongan Darah", data.gol_darah || "-"],
                ["Pendidikan", data.pendidikan || "-"],
                ["BPJS Kesehatan", data.bpjs_kesehatan || "-"],
                ["BPJS Ketenagakerjaan", data.bpjs_ketenagakerjaan || "-"],
                ["NPWP", data.npwp || "-"],
                ["Status", data.status || "-"],
            ],
            theme: "grid",
            headStyles: {
                fillColor: [27, 94, 32],
                textColor: [255, 255, 255],
                fontStyle: "bold",
            },
            styles: {
                font: "helvetica",
                fontSize: 10,
                cellPadding: 3,
            },
            alternateRowStyles: {
                fillColor: [240, 240, 240],
            },
        });

        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(10);
        doc.text("RAAF PalmChain © 2025", 105, pageHeight - 10, { align: "center" });

        doc.save(`pejabat_${data.nama_lengkap.replace(/\s+/g, '_')}.pdf`);
    } else {
        // Page report PDF
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(data.title, 105, 15, { align: "center" });

        doc.setLineWidth(0.5);
        doc.line(14, 18, 196, 18);

        const date = new Date().toLocaleDateString("id-ID");
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text(`Dicetak pada: ${date}`, 14, 25);
        doc.text(`Kabupaten: ${data.regency.name_bps}`, 14, 32);

        let yPosition = 40;

        // Statistics Section
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Statistik Pejabat", 14, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Total Pejabat: ${data.statistics.official_count.toLocaleString("id-ID")}`, 14, yPosition);
        yPosition += 6;
        doc.text(`Total Posisi: ${data.statistics.total_posisi.toLocaleString("id-ID")}`, 14, yPosition);
        yPosition += 6;
        doc.text(`Total Terisi: ${data.statistics.total_terisi.toLocaleString("id-ID")}`, 14, yPosition);
        yPosition += 6;
        doc.text(`Kelengkapan Data: ${data.statistics.kelengkapan_data}%`, 14, yPosition);
        yPosition += 15;

        // Gender Statistics
        if (data.statistics.jenis_kelamin) {
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Statistik Jenis Kelamin", 14, yPosition);
            yPosition += 10;

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Laki-laki: ${data.statistics.jenis_kelamin.L || 0}`, 14, yPosition);
            yPosition += 6;
            doc.text(`Perempuan: ${data.statistics.jenis_kelamin.P || 0}`, 14, yPosition);
            yPosition += 15;
        }

        // Education Statistics
        if (data.statistics.pendidikan) {
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Statistik Pendidikan", 14, yPosition);
            yPosition += 10;

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            Object.entries(data.statistics.pendidikan).forEach(([edu, count]) => {
                doc.text(`${edu}: ${count}`, 14, yPosition);
                yPosition += 6;
            });
            yPosition += 9;
        }

        // Status Statistics
        if (data.statistics.status_pejabat) {
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Statistik Status Pejabat", 14, yPosition);
            yPosition += 10;

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            Object.entries(data.statistics.status_pejabat).forEach(([status, count]) => {
                doc.text(`${status}: ${count}`, 14, yPosition);
                yPosition += 6;
            });
            yPosition += 9;
        }

        // Religion Statistics
        if (data.statistics.agama) {
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Statistik Agama", 14, yPosition);
            yPosition += 10;

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            Object.entries(data.statistics.agama).forEach(([religion, count]) => {
                doc.text(`${religion}: ${count}`, 14, yPosition);
                yPosition += 6;
            });
            yPosition += 9;
        }

        // Blood Type Statistics
        if (data.statistics.golongan_darah) {
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Statistik Golongan Darah", 14, yPosition);
            yPosition += 10;

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            Object.entries(data.statistics.golongan_darah).forEach(([blood, count]) => {
                doc.text(`${blood}: ${count}`, 14, yPosition);
                yPosition += 6;
            });
            yPosition += 9;
        }

        // Marital Status Statistics
        if (data.statistics.status_perkawinan) {
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Statistik Status Perkawinan", 14, yPosition);
            yPosition += 10;

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            Object.entries(data.statistics.status_perkawinan).forEach(([status, count]) => {
                doc.text(`${status}: ${count}`, 14, yPosition);
                yPosition += 6;
            });
            yPosition += 15;
        }

        // Officials Table
        if (data.officials && data.officials.length > 0) {
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Daftar Pejabat", 14, yPosition);
            yPosition += 10;

            const tableData = data.officials.map(official => [
                official.nik,
                official.nama_lengkap,
                official.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan",
                official.pendidikan || "-",
                official.status || "-",
                official.agama || "-",
                official.gol_darah || "-",
                official.status_perkawinan || "-",
                official.handphone || "-",
                official.alamat || "-"
            ]);

            doc.autoTable({
                startY: yPosition,
                head: [["NIK", "Nama Lengkap", "Jenis Kelamin", "Pendidikan", "Status", "Agama", "Gol. Darah", "Status Kawin", "Handphone", "Alamat"]],
                body: tableData,
                theme: "grid",
                headStyles: {
                    fillColor: [27, 94, 32],
                    textColor: [255, 255, 255],
                    fontStyle: "bold",
                },
                styles: {
                    font: "helvetica",
                    fontSize: 6,
                    cellPadding: 1,
                },
                alternateRowStyles: {
                    fillColor: [240, 240, 240],
                },
                columnStyles: {
                    0: { cellWidth: 20 },
                    1: { cellWidth: 35 },
                    2: { cellWidth: 15 },
                    3: { cellWidth: 25 },
                    4: { cellWidth: 15 },
                    5: { cellWidth: 20 },
                    6: { cellWidth: 15 },
                    7: { cellWidth: 20 },
                    8: { cellWidth: 25 },
                    9: { cellWidth: 40 },
                },
            });
        }

        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(10);
        doc.text("RAAF PalmChain © 2025", 105, pageHeight - 10, { align: "center" });

        doc.save(`laporan_pejabat_${data.regency.code_bps}_${new Date().toISOString().split('T')[0]}.pdf`);
    }
};

export default PDF;
