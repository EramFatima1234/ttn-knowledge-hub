"use client";

import type { ReactNode } from "react";
import AspireTable from "@/components/ui/AspireTable";
import type { AspireTableProps } from "@/components/ui/AspireTable";
import CmsFilterSearch from "@/features/admin-cms/components/CmsFilterSearch";
import CmsTableExportButton from "@/features/admin-cms/components/CmsTableExportButton";
import type { ExcelExportColumn } from "@/lib/exportExcel";

export interface CmsTableExportConfig<T extends object> {
  filename: string;
  sheetName?: string;
  columns: ExcelExportColumn<T>[];
  getRows?: () => T[];
}

export interface CmsTableSearchConfig {
  placeholder: string;
  onSearch: (value: string) => void;
}

interface CmsDataTableProps<RecordType extends object> extends AspireTableProps<RecordType> {
  toolbar?: ReactNode;
  search?: CmsTableSearchConfig;
  exportConfig?: CmsTableExportConfig<RecordType>;
}

export default function CmsDataTable<RecordType extends object>({
  toolbar,
  search,
  exportConfig,
  className,
  dataSource,
  ...tableProps
}: CmsDataTableProps<RecordType>) {
  const rows = exportConfig?.getRows?.()
    ?? (Array.isArray(dataSource) ? dataSource : []);

  const showToolbar = Boolean(search || toolbar || exportConfig);

  return (
    <div className="tableWrapper kh-cms-table-wrapper">
      {showToolbar && (
        <div className="kh-cms-table-toolbar">
          <div className="kh-cms-table-toolbar__start">
            {search && (
              <CmsFilterSearch
                placeholder={search.placeholder}
                onSearch={search.onSearch}
              />
            )}
            {toolbar}
          </div>
          {exportConfig && (
            <CmsTableExportButton
              filename={exportConfig.filename}
              sheetName={exportConfig.sheetName}
              columns={exportConfig.columns}
              rows={rows}
            />
          )}
        </div>
      )}
      <AspireTable<RecordType>
        {...tableProps}
        dataSource={dataSource}
        className={className}
        pagination={tableProps.pagination ?? false}
        aspirePaginationDefaults={tableProps.pagination !== false}
      />
    </div>
  );
}
