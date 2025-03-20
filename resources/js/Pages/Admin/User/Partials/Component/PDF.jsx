import jsPDF from "jspdf";
import "jspdf-autotable";

const PDF = (item) => {
    const doc = new jsPDF();

    // Tambahkan Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Detail Official", 105, 15, { align: "center" });

    // Tambahkan Garis Bawah Header
    doc.setLineWidth(0.5);
    doc.line(14, 18, 196, 18);

    // Tambahkan Tanggal Cetak
    const date = new Date().toLocaleDateString("id-ID");
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text(`Dicetak pada: ${date}`, 14, 25);

    // Tabel dengan Styling
    doc.autoTable({
        startY: 30,
        head: [["Field", "Value"]],
        body: [
            ["ID", item.id],
            ["Nama", item.name]
        ],
        theme: "grid",
        headStyles: {
            fillColor: [27, 94, 32], // Warna utama RAAF PalmChain (Deep Forest Green)
            textColor: [255, 255, 255], // Putih
            fontStyle: "bold",
        },
        styles: {
            font: "helvetica",
            fontSize: 12,
            cellPadding: 5,
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240], // Warna abu-abu untuk baris selang-seling
        },
    });

    // Tambahkan Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.text("RAAF PalmChain © 2025", 105, pageHeight - 10, { align: "center" });

    // Simpan PDF
    doc.save(`official_${item.id}.pdf`);
};

export default PDF;
