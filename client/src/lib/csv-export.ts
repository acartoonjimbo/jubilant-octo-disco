interface CSVData {
  timestamp: number;
  formattedTime: string;
  category: string;
  description: string;
  players: string;
  videoUrl: string;
  createdAt: string;
}

export function exportToCSV(data: CSVData[], filename: string) {
  // Define CSV headers
  const headers = [
    'Timestamp (seconds)',
    'Formatted Time',
    'Category',
    'Description',
    'Players',
    'Video URL',
    'Created At'
  ];

  // Convert data to CSV format
  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      row.timestamp,
      `"${row.formattedTime}"`,
      `"${row.category}"`,
      `"${row.description.replace(/"/g, '""')}"`, // Escape quotes in description
      `"${row.players}"`,
      `"${row.videoUrl}"`,
      `"${row.createdAt}"`
    ].join(','))
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
