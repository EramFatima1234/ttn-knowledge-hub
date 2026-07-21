export interface ExcelExportColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function exportToExcel<T>(
  filename: string,
  columns: ExcelExportColumn<T>[],
  rows: T[],
  sheetName = "Sheet1",
): void {
  if (rows.length === 0 || columns.length === 0) {
    return;
  }

  const headerRow = columns
    .map(
      (column) =>
        `<Cell><Data ss:Type="String">${escapeXml(column.header)}</Data></Cell>`,
    )
    .join("");

  const dataRows = rows
    .map((row) => {
      const cells = columns
        .map((column) => {
          const raw = column.value(row);
          if (raw == null || raw === "") {
            return `<Cell><Data ss:Type="String"></Data></Cell>`;
          }

          if (typeof raw === "number" && Number.isFinite(raw)) {
            return `<Cell><Data ss:Type="Number">${raw}</Data></Cell>`;
          }

          return `<Cell><Data ss:Type="String">${escapeXml(String(raw))}</Data></Cell>`;
        })
        .join("");

      return `<Row>${cells}</Row>`;
    })
    .join("");

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="${escapeXml(sheetName)}">
  <Table>
   <Row>${headerRow}</Row>
   ${dataRows}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".xls") || filename.endsWith(".xlsx")
    ? filename
    : `${filename}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
