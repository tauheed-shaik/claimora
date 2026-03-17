import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

export interface Expense {
  id: string;
  deploymentId: string;
  userId: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  receiptImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deployment {
  id: string;
  userId: string;
  projectName: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const generateExcel = async (deployment: Deployment, expenses: Expense[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reimbursement Report');

  // Add Deployment Info
  worksheet.addRow(['Deployment Expense & Reimbursement Report']);
  worksheet.addRow(['Project Name', deployment.projectName]);
  worksheet.addRow(['Location', deployment.location]);
  worksheet.addRow(['Dates', `${deployment.startDate} to ${deployment.endDate}`]);
  worksheet.addRow(['Status', deployment.status]);
  worksheet.addRow([]);

  // Add Headers
  worksheet.addRow(['Date', 'Category', 'Description', 'Amount (₹)']);
  
  // Style Headers
  const headerRow = worksheet.getRow(7);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Add Data
  let total = 0;
  // Sort expenses by date
  const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  sortedExpenses.forEach(exp => {
    worksheet.addRow([exp.date, exp.category, exp.description, exp.amount]);
    total += exp.amount;
  });

  worksheet.addRow([]);
  const totalRow = worksheet.addRow(['', '', 'Total', total]);
  totalRow.font = { bold: true };

  // Adjust column widths
  worksheet.columns = [
    { width: 15 },
    { width: 20 },
    { width: 40 },
    { width: 15, numFmt: '₹#,##0.00' }
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Reimbursement_${deployment.projectName.replace(/\s+/g, '_')}.xlsx`;
  link.click();
};

export const generatePDF = (deployment: Deployment, expenses: Expense[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Receipts & Bills Compilation', 14, 20);
  
  doc.setFontSize(12);
  doc.text(`Project: ${deployment.projectName}`, 14, 30);
  doc.text(`Location: ${deployment.location}`, 14, 38);
  doc.text(`Dates: ${deployment.startDate} to ${deployment.endDate}`, 14, 46);

  let yOffset = 60;
  
  const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  sortedExpenses.forEach((exp, index) => {
    if (yOffset > 250) {
      doc.addPage();
      yOffset = 20;
    }

    doc.setFontSize(14);
    doc.text(`Receipt ${index + 1}: ${exp.date} - ${exp.category} - Rs. ${exp.amount}`, 14, yOffset);
    doc.setFontSize(10);
    doc.text(`Description: ${exp.description}`, 14, yOffset + 6);

    if (exp.receiptImage) {
      try {
        // Add image (assuming JPEG base64)
        doc.addImage(exp.receiptImage, 'JPEG', 14, yOffset + 10, 100, 100 * 0.75); // Fixed aspect ratio approx
        yOffset += 95;
      } catch (e) {
        console.error("Failed to add image to PDF", e);
        doc.text("Image could not be loaded.", 14, yOffset + 15);
        yOffset += 25;
      }
    } else {
      doc.text("No receipt image provided.", 14, yOffset + 15);
      yOffset += 25;
    }
  });

  doc.save(`Receipts_${deployment.projectName.replace(/\s+/g, '_')}.pdf`);
};
