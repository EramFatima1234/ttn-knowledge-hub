"use client";

import { Button, Tooltip } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { exportToExcel, type ExcelExportColumn } from "@/lib/exportExcel";

interface CmsTableExportButtonProps<T extends object> {
  filename: string;
  sheetName?: string;
  columns: ExcelExportColumn<T>[];
  rows: T[];
  disabled?: boolean;
}

export default function CmsTableExportButton<T extends object>({
  filename,
  sheetName,
  columns,
  rows,
  disabled,
}: CmsTableExportButtonProps<T>) {
  const handleExport = () => {
    exportToExcel(filename, columns, rows, sheetName);
  };

  return (
    <Tooltip title="Download Excel">
      <Button
        type="text"
        className="kh-cms-table-export"
        icon={<DownloadOutlined />}
        aria-label="Download Excel"
        disabled={disabled || rows.length === 0}
        onClick={handleExport}
      />
    </Tooltip>
  );
}
