import Papa from 'papaparse';
import { jsPDF } from 'jspdf';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(date: string): string {
  if (!date) return '';
  return new Date(date).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export function generateReceiptNo(): string {
  return `RCP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    'Paid': 'emerald', 'Pending': 'amber', 'Overdue': 'rose', 'Partial': 'blue',
    'Active': 'emerald', 'Inactive': 'slate', 'Available': 'emerald', 'Occupied': 'blue',
    'Under Maintenance': 'amber', 'Resolved': 'emerald', 'Closed': 'slate',
    'Open': 'rose', 'Assigned': 'blue', 'In Progress': 'amber',
    'Approved': 'emerald', 'Rejected': 'rose', 'Checked Out': 'slate',
    'Present': 'emerald', 'Absent': 'rose', 'Late': 'amber', 'Half-Day': 'orange',
    'Good': 'emerald', 'Fair': 'amber', 'Poor': 'rose', 'Needs Replacement': 'red',
    'Draft': 'slate', 'Submitted': 'blue', 'Under Review': 'amber', 'Allocated': 'emerald',
    'Transferred': 'blue', 'Vacated': 'slate',
  };
  return map[status] || 'slate';
}

export function generateCSV<T extends Record<string, any>>(data: T[], filename: string): void {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function generatePDF(title: string, _columns: string[], _rows: any[][], filename: string): void {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  let y = 30;
  _columns.forEach((col, i) => {
    doc.text(col, 14 + i * 30, y);
  });
  y += 10;
  _rows.forEach(row => {
    row.forEach((cell: any, i: number) => {
      doc.text(String(cell), 14 + i * 30, y);
    });
    y += 8;
    if (y > 280) { doc.addPage(); y = 20; }
  });
  doc.save(`${filename}.pdf`);
}
