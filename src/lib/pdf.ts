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

export const exportCertificatePDF = async (participant: any, exam: any, settings?: any) => {
    const doc = new jsPDF({
        orientation: 'landscape'
    });

    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // Background Loading
    if (settings?.certificate_bg) {
        try {
            const img = new Image();
            img.src = settings.certificate_bg;
            img.crossOrigin = "Anonymous";
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });
            doc.addImage(img, 'JPEG', 0, 0, width, height);
        } catch (e) {
            console.error("Failed to load certificate bg", e);
            // Fallback to default border if image fails
            drawDefaultBorder(doc, width, height);
        }
    } else {
        drawDefaultBorder(doc, width, height);
    }

    // Colors
    // If background is used, we might want white text? detailed implementation depends on design. 
    // For now assume light background or white paper.
    doc.setTextColor(30, 41, 59); // var(--slate-800)

    // Title
    const title = settings?.certificate_title || 'CERTIFICATE OF COMPLETION';
    doc.setFontSize(40);
    doc.setFont('helvetica', 'bold');
    doc.text(title, width / 2, 60, { align: 'center' });

    // Subtitle
    if (!settings?.certificate_title) {
        doc.setFontSize(20);
        doc.text('OF COMPLETION', width / 2, 75, { align: 'center' });
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('This is to certify that', width / 2, 95, { align: 'center' });

    // Participant Name
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42); // var(--slate-900)
    doc.text(participant.full_name, width / 2, 115, { align: 'center' });

    // Completion Text
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text('has successfully completed the exam:', width / 2, 135, { align: 'center' });

    // Exam Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(exam.title, width / 2, 155, { align: 'center' });

    // Score
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105); // var(--slate-600)
    doc.text(`Score: ${participant.score}%`, width / 2, 175, { align: 'center' });

    // Date (Optional)
    const date = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Issued on: ${date}`, width / 2, 185, { align: 'center' });

    doc.save(`Certificate_${participant.full_name.replace(/\s+/g, '_')}.pdf`);
};

function drawDefaultBorder(doc: jsPDF, width: number, height: number) {
    doc.setDrawColor(182, 141, 64); // var(--secondary)
    doc.setLineWidth(5);
    doc.rect(10, 10, width - 20, height - 20);
}
