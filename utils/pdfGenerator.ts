import { jsPDF } from 'jspdf';
import { Transaction } from '../types';

export function generateReceiptPDF(tx: Transaction) {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Base layout: Outer frame/border
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, 277);

    // Header background banner
    doc.setFillColor(17, 24, 39); // Dark navy/charcoal
    doc.rect(10, 10, 190, 35, 'F');

    // Title / Brand Name
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('PRISPARIMO VAULT', 15, 25);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(209, 213, 219);
    doc.text('OFFICIAL TRANSACTION RECEIPT', 15, 32);

    // Receipt details right-aligned in header
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`STATUS: ${tx.status?.toUpperCase() || 'COMPLETED'}`, 135, 23);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(`DATE: ${new Date(tx.date).toLocaleString()}`, 135, 29);

    // Section title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 118, 110); // Teal accent
    doc.text('TRANSACTION OVERVIEW', 20, 60);

    // Add a divider line
    doc.setDrawColor(15, 118, 110);
    doc.setLineWidth(0.5);
    doc.line(20, 63, 190, 63);

    // Grid data helper
    const drawRow = (label: string, value: string, y: number) => {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        doc.text(label, 20, y);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(17, 24, 39);
        doc.text(value || 'N/A', 80, y);
    };

    // Draw fields
    let currentY = 72;
    drawRow('Transaction Reference:', tx.reference, currentY); currentY += 10;
    drawRow('Payment Type:', tx.type === 'debit' ? 'Debit (Outgoing)' : 'Credit (Incoming)', currentY); currentY += 10;
    drawRow('Category:', tx.category || 'Transfer', currentY); currentY += 10;
    drawRow('Description:', tx.description, currentY); currentY += 10;

    // Sender Info Section
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 118, 110);
    doc.text('SENDER INFORMATION', 20, currentY); currentY += 3;
    doc.setDrawColor(229, 231, 235);
    doc.line(20, currentY, 190, currentY); currentY += 8;

    drawRow('Sender Name:', tx.senderName || 'Prisparimo Customer', currentY); currentY += 10;
    drawRow('Sender Account:', tx.senderAccount || 'N/A', currentY); currentY += 10;

    // Recipient Info Section
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 118, 110);
    doc.text('RECIPIENT INFORMATION', 20, currentY); currentY += 3;
    doc.line(20, currentY, 190, currentY); currentY += 8;

    drawRow('Recipient Name:', tx.receiverName || 'N/A', currentY); currentY += 10;
    drawRow('Recipient Account:', tx.receiverAccount || 'N/A', currentY); currentY += 10;
    drawRow('Financial Institution:', tx.bankName || 'N/A', currentY); currentY += 10;
    drawRow('Destination Country:', tx.country || 'United Kingdom', currentY); currentY += 12;

    // Financial breakdown section
    doc.setFillColor(243, 244, 246);
    doc.rect(20, currentY, 170, 32, 'F');
    
    // Amount
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text('Transfer Amount:', 25, currentY + 10);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    const currencySym = tx.currency || 'GBP';
    doc.text(`${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currencySym}`, 125, currentY + 10);

    // Fee
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text('Processing Fee:', 25, currentY + 18);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`${(tx.fee || 0).toFixed(2)} ${currencySym}`, 125, currentY + 18);

    // Total Charge
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 118, 110);
    doc.text('Total Deductions:', 25, currentY + 26);
    doc.setFontSize(12);
    const totalDeducted = Math.abs(tx.amount) + (tx.fee || 0);
    doc.text(`${totalDeducted.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currencySym}`, 125, currentY + 26);

    currentY += 45;

    // Bottom message / footer disclaimer
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text('SECURITY ENCRYPTED HANDSHAKE VERIFIED', 105, currentY, { align: 'center' });
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('This receipt is a digitally generated document confirming settlement on the secure Prisparimo Ledger.', 105, currentY + 4, { align: 'center' });

    // Download PDF
    doc.save(`Receipt-${tx.reference || tx.id}.pdf`);
}
