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

    const w = doc.internal.pageSize.getWidth();   // 297
    const h = doc.internal.pageSize.getHeight();   // 210
    const cx = w / 2;

    // ── Brand Colors ──
    const maroon = [138, 21, 27] as const;       // #8A151B — primary brand
    const navy = [27, 43, 75] as const;        // #1B2B4B — dark sections
    const gold = [192, 130, 63] as const;      // #C0823F — gold accent
    const slate = [100, 116, 139] as const;     // muted text
    const darkText = [15, 23, 42] as const;        // body text

    // ── Background ──
    let hasCustomBg = false;
    if (settings?.certificate_bg) {
        try {
            const img = new Image();
            img.src = settings.certificate_bg;
            img.crossOrigin = "Anonymous";
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });
            doc.addImage(img, 'JPEG', 0, 0, w, h);
            hasCustomBg = true;
        } catch (e) {
            console.error("Failed to load certificate bg", e);
        }
    }

    if (!hasCustomBg) {
        // White base
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, w, h, 'F');

        // Top maroon accent bar
        doc.setFillColor(245, 240, 235);  // warm off-white like brand bg
        doc.rect(0, 0, w, 6, 'F');
        doc.setFillColor(...maroon);
        doc.rect(0, 0, w, 2.5, 'F');

        // Bottom navy strip
        doc.setFillColor(...navy);
        doc.rect(0, h - 18, w, 18, 'F');

        // Outer frame — gold border
        doc.setDrawColor(...gold);
        doc.setLineWidth(1.0);
        doc.rect(8, 8, w - 16, h - 16);

        // Inner frame — subtle light
        doc.setDrawColor(230, 220, 205);
        doc.setLineWidth(0.3);
        doc.rect(12, 12, w - 24, h - 24);

        // Corner ornaments in gold
        drawCornerOrnaments(doc, w, h, gold);
    }

    // ── Logo ──
    try {
        const logoImg = new Image();
        logoImg.src = '/logo.png';
        logoImg.crossOrigin = "Anonymous";
        await new Promise((resolve, reject) => {
            logoImg.onload = resolve;
            logoImg.onerror = reject;
        });
        const logoW = 28;
        const logoH = 20;
        doc.addImage(logoImg, 'PNG', cx - logoW / 2, 16, logoW, logoH);
    } catch (e) {
        // Fallback: text-only header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...maroon);
        doc.text('LSP OFFICIUM NOBILE INDOLAW', cx, 26, { align: 'center' });
    }

    // ── Organization Name ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...navy);
    doc.text('LSP OFFICIUM NOBILE INDOLAW', cx, 40, { align: 'center' });
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...slate);
    doc.text('Kompetensi Advokat Indonesia', cx, 45, { align: 'center' });

    // ── Maroon divider ──
    doc.setDrawColor(...maroon);
    doc.setLineWidth(0.6);
    doc.line(cx - 50, 49, cx + 50, 49);

    // ── Certificate Title Badge ──
    const badgeY = 56;
    const title = settings?.certificate_title || 'CERTIFICATE OF COMPLETION';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    const badgeW = doc.getTextWidth(title) + 20;
    doc.setFillColor(...maroon);
    roundedRect(doc, cx - badgeW / 2, badgeY - 5, badgeW, 11, 2);
    doc.setTextColor(255, 255, 255);
    doc.text(title, cx, badgeY + 2, { align: 'center' });

    // ── "This is to certify that" ──
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...slate);
    doc.text('This is to certify that', cx, 72, { align: 'center' });

    // ── Decorative lines + Participant Name ──
    const nameY = 84;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    const estimatedNameW = doc.getTextWidth(participant.full_name);
    const lineGap = 8;
    const lineLen = 35;
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.5);
    doc.line(cx - estimatedNameW / 2 - lineGap - lineLen, nameY - 3, cx - estimatedNameW / 2 - lineGap, nameY - 3);
    doc.line(cx + estimatedNameW / 2 + lineGap, nameY - 3, cx + estimatedNameW / 2 + lineGap + lineLen, nameY - 3);

    doc.setTextColor(...navy);
    doc.text(participant.full_name, cx, nameY, { align: 'center' });

    // ── Subtitle ──
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...darkText);
    doc.text('has successfully completed the certification examination', cx, 94, { align: 'center' });
    doc.text('and has earned the following result:', cx, 100, { align: 'center' });

    // ── Score Badge ──
    const badgeCY = 128;
    drawScoreBadge(doc, cx, badgeCY, participant.score, maroon, gold);

    // ── Exam Title ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...navy);
    doc.text(exam.title, cx, 158, { align: 'center' });

    // ── Award Date ──
    const date = participant.end_time
        ? new Date(participant.end_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...slate);
    doc.text('Awarded on:', cx, 168, { align: 'center' });
    doc.setFontSize(11);
    doc.setTextColor(...navy);
    doc.text(date, cx, 174, { align: 'center' });

    // ── Footer (in navy bar) ──
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(200, 200, 210);
    doc.text('This certificate verifies the successful completion of the examination.', cx, h - 10, { align: 'center' });
    doc.text('LSP Officium Nobile Indolaw — hukum-dashboard.vercel.app', cx, h - 5.5, { align: 'center' });

    doc.save(`Certificate_${participant.full_name.replace(/\s+/g, '_')}.pdf`);
};

// ── Helper: Score badge with rotating squares (brand maroon) ──
function drawScoreBadge(doc: jsPDF, cx: number, cy: number, score: number, brand: readonly number[], gold: readonly number[]) {
    const sizes = [36, 30, 24];
    const angles = [0, 15, 30];

    sizes.forEach((size, i) => {
        const angle = (angles[i] * Math.PI) / 180;
        const half = size / 2;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const points = [
            { x: cx + half * cos - (-half) * sin, y: cy + half * sin + (-half) * cos },
            { x: cx + half * cos - half * sin, y: cy + half * sin + half * cos },
            { x: cx + (-half) * cos - half * sin, y: cy + (-half) * sin + half * cos },
            { x: cx + (-half) * cos - (-half) * sin, y: cy + (-half) * sin + (-half) * cos },
        ];

        doc.setDrawColor(brand[0], brand[1], brand[2]);
        doc.setLineWidth(0.4);
        doc.line(points[0].x, points[0].y, points[1].x, points[1].y);
        doc.line(points[1].x, points[1].y, points[2].x, points[2].y);
        doc.line(points[2].x, points[2].y, points[3].x, points[3].y);
        doc.line(points[3].x, points[3].y, points[0].x, points[0].y);
    });

    // Central filled circle
    doc.setFillColor(brand[0], brand[1], brand[2]);
    doc.circle(cx, cy, 16, 'F');

    // Score text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text(`${score}%`, cx, cy + 2, { align: 'center' });

    doc.setFontSize(6);
    doc.setTextColor(255, 255, 255);
    doc.text('SCORE', cx, cy + 8, { align: 'center' });
}

// ── Helper: Corner ornaments ──
function drawCornerOrnaments(doc: jsPDF, w: number, h: number, color: readonly number[]) {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(1.2);
    const inset = 14;
    const len = 12;

    doc.line(inset, inset, inset + len, inset);
    doc.line(inset, inset, inset, inset + len);
    doc.line(w - inset, inset, w - inset - len, inset);
    doc.line(w - inset, inset, w - inset, inset + len);
    doc.line(inset, h - inset, inset + len, h - inset);
    doc.line(inset, h - inset, inset, h - inset - len);
    doc.line(w - inset, h - inset, w - inset - len, h - inset);
    doc.line(w - inset, h - inset, w - inset, h - inset - len);
}

// ── Helper: Rounded rectangle ──
function roundedRect(doc: jsPDF, x: number, y: number, w: number, h: number, r: number) {
    doc.roundedRect(x, y, w, h, r, r, 'F');
}

