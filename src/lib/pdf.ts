import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const exportExamToPDF = (exam: any, questions: any[]) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 58, 138); // var(--primary)
    doc.text('HUKUM CERTIFICATION', 105, 20, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(exam.title, 105, 30, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Duration: ${exam.duration} Minutes`, 20, 45);
    doc.text(`Total Questions: ${questions.length}`, 190, 45, { align: 'right' });

    doc.setLineWidth(0.5);
    doc.line(20, 50, 190, 50);

    // Questions
    let yPos = 65;
    questions.forEach((q, index) => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${q.content}`, 20, yPos);
        yPos += 10;

        doc.setFont('helvetica', 'normal');
        if (q.type === 'multiple_choice' && q.options) {
            q.options.forEach((opt: string, i: number) => {
                doc.text(`[ ] ${opt}`, 30, yPos);
                yPos += 8;
            });
        } else if (q.type === 'boolean') {
            doc.text(`[ ] True`, 30, yPos);
            yPos += 8;
            doc.text(`[ ] False`, 30, yPos);
            yPos += 8;
        } else {
            doc.rect(20, yPos, 170, 30);
            yPos += 35;
        }

        yPos += 5;
    });

    doc.save(`${exam.title.replace(/\s+/g, '_')}_Test.pdf`);
};

export const exportCertificatePDF = (participant: any, exam: any) => {
    const doc = new jsPDF({
        orientation: 'landscape'
    });

    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // Border
    doc.setDrawColor(182, 141, 64); // var(--secondary)
    doc.setLineWidth(5);
    doc.rect(10, 10, width - 20, height - 20);

    // Content
    doc.setFontSize(40);
    doc.text('CERTIFICATE', width / 2, 50, { align: 'center' });
    doc.setFontSize(20);
    doc.text('OF COMPLETION', width / 2, 65, { align: 'center' });

    doc.setFontSize(16);
    doc.text('This is to certify that', width / 2, 90, { align: 'center' });

    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text(participant.full_name, width / 2, 110, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('has successfully completed the legal certification test:', width / 2, 130, { align: 'center' });

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(exam.title, width / 2, 150, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Score: ${participant.score}%`, width / 2, 165, { align: 'center' });

    doc.save(`Certificate_${participant.full_name.replace(/\s+/g, '_')}.pdf`);
};
