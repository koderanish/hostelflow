export function exportCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportPDFPlaceholder(filename: string) {
  const blob = new Blob([`PDF export placeholder for ${filename}. In production, use a library like jsPDF or pdfmake.`], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportExcelPlaceholder(filename: string) {
  const blob = new Blob([`Excel export placeholder for ${filename}. In production, use a library like xlsx or exceljs.`], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
}
