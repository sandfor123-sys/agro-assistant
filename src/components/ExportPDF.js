import jsPDF from 'jspdf';
import { Download } from 'lucide-react';

export default function ExportPDF({ data, filename }) {
    const handleExport = () => {
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(20);
        doc.text('Rapport AgriAssist', 20, 20);
        
        // Add date
        doc.setFontSize(12);
        doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 35);
        
        // Add content
        let yPosition = 50;
        doc.setFontSize(14);
        
        Object.entries(data).forEach(([key, value]) => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.setFont(undefined, 'bold');
            doc.text(`${key}:`, 20, yPosition);
            yPosition += 10;
            
            doc.setFont(undefined, 'normal');
            const lines = doc.splitTextToSize(String(value), 170);
            lines.forEach(line => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(line, 20, yPosition);
                yPosition += 7;
            });
            
            yPosition += 5;
        });
        
        // Save PDF
        doc.save(`${filename}.pdf`);
    };

    return (
        <button
            onClick={handleExport}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
        >
            <Download size={18} />
            Exporter PDF
        </button>
    );
}
