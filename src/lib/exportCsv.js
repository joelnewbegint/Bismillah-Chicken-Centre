export const downloadCsv = (filename, headers, rows) => {
  const safe = (value) => {
    const stringValue = `${value ?? ""}`.replace(/"/g, '""');
    return `"${stringValue}"`;
  };

  const csv = [headers.map(safe).join(","), ...rows.map((row) => row.map(safe).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
