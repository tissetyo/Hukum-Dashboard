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

    // ── Colors ──
    const navy = [15, 30, 62] as const;       // deep navy
    const teal = [0, 150, 136] as const;       // teal accent
    const gold = [182, 141, 64] as const;      // gold accent
    const slate = [71, 85, 105] as const;       // muted text
    const darkText = [30, 41, 59] as const;        // body text

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

        // Subtle top gradient bar (teal → transparent look)
        doc.setFillColor(240, 253, 250);
        doc.rect(0, 0, w, 6, 'F');
        doc.setFillColor(0, 150, 136);
        doc.rect(0, 0, w, 2, 'F');

        // Bottom accent bar
        doc.setFillColor(240, 248, 255);
        doc.rect(0, h - 30, w, 30, 'F');
        doc.setFillColor(0, 150, 136);
        doc.rect(0, h - 2, w, 2, 'F');

        // Outer frame — thin elegant border
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.8);
        doc.rect(8, 8, w - 16, h - 16);

        // Inner frame — dotted style
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.rect(12, 12, w - 24, h - 24);

        // Corner ornaments (small L-shapes in gold)
        drawCornerOrnaments(doc, w, h, gold);
    }

    // ── Organization / Logo Text ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...teal);
    doc.text('HUKUM CERTIFICATION', cx, 28, { align: 'center' });

    // ── Certificate Badge ──
    const badgeY = 36;
    const title = settings?.certificate_title || 'CERTIFICATE OF COMPLETION';
    const badgeW = doc.getTextWidth(title) + 16;
    doc.setFillColor(...teal);
    roundedRect(doc, cx - badgeW / 2, badgeY - 5, badgeW, 11, 2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(title, cx, badgeY + 2, { align: 'center' });

    // ── Decorative line + Participant Name ──
    const nameY = 62;
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.5);
    const nameWidth = doc.getTextWidth(participant.full_name);
    // Estimate name width at size 28
    doc.setFontSize(28);
    const estimatedNameW = doc.getTextWidth(participant.full_name);
    const lineGap = 8;
    const lineLen = 40;
    doc.line(cx - estimatedNameW / 2 - lineGap - lineLen, nameY - 3, cx - estimatedNameW / 2 - lineGap, nameY - 3);
    doc.line(cx + estimatedNameW / 2 + lineGap, nameY - 3, cx + estimatedNameW / 2 + lineGap + lineLen, nameY - 3);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(...navy);
    doc.text(participant.full_name, cx, nameY, { align: 'center' });

    // ── Subtitle text ──
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...darkText);
    doc.text('has successfully completed the certification exam', cx, 74, { align: 'center' });
    doc.text('and has earned the following result:', cx, 81, { align: 'center' });

    // ── Geometric Score Badge ──
    const badgeCenterY = 118;
    drawScoreBadge(doc, cx, badgeCenterY, participant.score, teal, gold);

    // ── Exam Title ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...navy);
    doc.text(exam.title, cx, 160, { align: 'center' });

    // ── Awarded On ──
    const date = participant.end_time
        ? new Date(participant.end_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...slate);
    doc.text('Awarded on:', cx, 172, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(...navy);
    doc.text(date, cx, 179, { align: 'center' });

    // ── Footer ──
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(160, 170, 180);
    doc.text('This certificate verifies the successful completion of the examination.', cx, h - 14, { align: 'center' });
    doc.text('Verify at: hukum-dashboard.vercel.app', cx, h - 9, { align: 'center' });

    doc.save(`Certificate_${participant.full_name.replace(/\s+/g, '_')}.pdf`);
};

// ── Helper: Draw geometric score badge (diamond with rotating squares) ──
function drawScoreBadge(doc: jsPDF, cx: number, cy: number, score: number, teal: readonly number[], gold: readonly number[]) {
    // Outer rotating squares (decorative, like EF SET)
    const sizes = [38, 32, 26];
    const angles = [0, 15, 30];
    const alphas = [0.08, 0.12, 0.18];

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

        doc.setDrawColor(teal[0], teal[1], teal[2]);
        doc.setLineWidth(0.4);
        // Use simple line drawing for the rotated square
        doc.line(points[0].x, points[0].y, points[1].x, points[1].y);
        doc.line(points[1].x, points[1].y, points[2].x, points[2].y);
        doc.line(points[2].x, points[2].y, points[3].x, points[3].y);
        doc.line(points[3].x, points[3].y, points[0].x, points[0].y);
    });

    // Central filled circle
    doc.setFillColor(teal[0], teal[1], teal[2]);
    doc.circle(cx, cy, 18, 'F');

    // Score text inside circle
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text(`${score}%`, cx, cy + 2, { align: 'center' });

    // Label below score
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text('SCORE', cx, cy + 9, { align: 'center' });
}

// ── Helper: Corner ornaments ──
function drawCornerOrnaments(doc: jsPDF, w: number, h: number, color: readonly number[]) {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(1.2);
    const inset = 14;
    const len = 12;

    // Top-left
    doc.line(inset, inset, inset + len, inset);
    doc.line(inset, inset, inset, inset + len);
    // Top-right
    doc.line(w - inset, inset, w - inset - len, inset);
    doc.line(w - inset, inset, w - inset, inset + len);
    // Bottom-left
    doc.line(inset, h - inset, inset + len, h - inset);
    doc.line(inset, h - inset, inset, h - inset - len);
    // Bottom-right
    doc.line(w - inset, h - inset, w - inset - len, h - inset);
    doc.line(w - inset, h - inset, w - inset, h - inset - len);
}

// ── Helper: Rounded rectangle ──
function roundedRect(doc: jsPDF, x: number, y: number, w: number, h: number, r: number) {
    doc.roundedRect(x, y, w, h, r, r, 'F');
}
