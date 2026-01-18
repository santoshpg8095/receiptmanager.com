const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const generateReceiptPDF = (receipt, user, qrCodeDataUrl) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Rent Receipt - ${receipt.receiptNumber}`,
          Author: user.pgName,
          Subject: 'Rent Payment Receipt'
        }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      /* ---------------- COLORS & FONTS ---------------- */
      const PRIMARY = '#1f2937';      // Slate dark
      const MUTED = '#6b7280';        // Gray
      const LIGHT = '#f3f4f6';        // Light gray
      const ACCENT = '#2563eb';       // Blue
      const SUCCESS = '#16a34a';      // Green

      /* ---------------- HEADER ---------------- */
      doc
        .rect(0, 0, doc.page.width, 90)
        .fill(PRIMARY);

      doc
        .fillColor('white')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text(user.pgName, 50, 30);

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(user.pgAddress, 50, 60)
        .text(`Phone: ${user.pgContact}`, 50, 74);

      /* ---------------- RECEIPT META ---------------- */
      doc
        .fillColor(PRIMARY)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('RENT RECEIPT', 400, 35, { align: 'right' });

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(MUTED)
        .text(`Receipt No: ${receipt.receiptNumber}`, 400, 55, { align: 'right' })
        .text(
          `Date: ${new Date(receipt.createdAt).toLocaleDateString('en-IN')}`,
          400,
          70,
          { align: 'right' }
        );

      /* ---------------- TENANT DETAILS ---------------- */
      let y = 120;

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor(PRIMARY)
        .text('Tenant Details', 50, y);

      y += 15;
      doc
        .moveTo(50, y)
        .lineTo(545, y)
        .lineWidth(0.5)
        .strokeColor(LIGHT)
        .stroke();

      y += 15;
      doc.fontSize(10).font('Helvetica').fillColor(PRIMARY);

      const labelX = 50;
      const valueX = 180;

      const detailRow = (label, value) => {
        doc.fillColor(MUTED).text(label, labelX, y);
        doc.fillColor(PRIMARY).text(value || '-', valueX, y);
        y += 18;
      };

      detailRow('Tenant Name', receipt.receivedFrom);
      detailRow('Mobile Number', receipt.tenantPhone);
      detailRow('Room Number', receipt.roomNumber);
      detailRow('Rent For Month', receipt.forMonth);
      detailRow('Payment Mode', receipt.paymentMode.toUpperCase());

      if (receipt.transactionId) {
        detailRow('Transaction ID', receipt.transactionId);
      }

      /* ---------------- AMOUNT TABLE ---------------- */
      y += 15;
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor(PRIMARY)
        .text('Payment Summary', 50, y);

      y += 15;

      doc
        .rect(50, y, 495, 30)
        .fill(LIGHT);

      doc
        .fillColor(PRIMARY)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Description', 60, y + 10)
        .text('Amount (₹)', 450, y + 10, { align: 'right' });

      y += 40;

      const amountRow = (label, amount, bold = false) => {
        doc
          .font(bold ? 'Helvetica-Bold' : 'Helvetica')
          .fillColor(PRIMARY)
          .text(label, 60, y);

        doc
          .text(amount.toFixed(2), 450, y, { align: 'right' });

        y += 22;
      };

      amountRow('Monthly Rent', receipt.amount);
      if (receipt.securityDeposit) amountRow('Security Deposit', receipt.securityDeposit);
      if (receipt.electricityCharges) amountRow('Electricity Charges', receipt.electricityCharges);
      if (receipt.waterCharges) amountRow('Water Charges', receipt.waterCharges);
      if (receipt.otherCharges) amountRow('Other Charges', receipt.otherCharges);

      doc.moveTo(60, y).lineTo(545, y).strokeColor(LIGHT).stroke();
      y += 10;

      amountRow('Total Amount', receipt.totalAmount, true);

      doc
        .rect(50, y, 495, 30)
        .fill('#ecfdf5');

      doc
        .font('Helvetica-Bold')
        .fillColor(SUCCESS)
        .text('Amount Paid', 60, y + 8)
        .text(`₹ ${receipt.amountPaid.toFixed(2)}`, 450, y + 8, {
          align: 'right'
        });

      y += 50;

      /* ---------------- PAID STAMP ---------------- */
      if (receipt.balanceDue === 0) {
        doc
          .save()
          .rotate(-20, { origin: [400, 300] })
          .fontSize(50)
          .fillColor(SUCCESS)
          .opacity(0.15)
          .font('Helvetica-Bold')
          .text('PAID', 350, 280);
        doc.restore();
      }

      /* ---------------- QR VERIFICATION ---------------- */
      if (qrCodeDataUrl) {
        const qr = qrCodeDataUrl.split(',')[1];
        doc.image(Buffer.from(qr, 'base64'), 430, y, { width: 90 });

        doc
          .fontSize(8)
          .fillColor(MUTED)
          .text('Scan to verify receipt', 430, y + 95, {
            width: 90,
            align: 'center'
          });
      }

      /* ---------------- FOOTER ---------------- */
      doc
        .fontSize(8)
        .fillColor(MUTED)
        .text(
          `Receipt ID: ${receipt.verificationHash}`,
          50,
          doc.page.height - 70
        )
        .text(
          'This is a system-generated receipt and does not require a signature.',
          50,
          doc.page.height - 55
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateReceiptPDF };
