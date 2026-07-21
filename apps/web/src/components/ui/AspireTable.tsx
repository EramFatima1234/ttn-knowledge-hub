"use client";

import { Table } from "antd";
import type { TableProps } from "antd";

const aspirePaginationShowTotal = (total: number, range: [number, number]) =>
  `Showing ${range[0]} to ${range[1]} of ${total}`;

export type AspireTableProps<RecordType extends object> = Omit<
  TableProps<RecordType>,
  "className" | "scroll" | "pagination"
> & {
  className?: string;
  scroll?: TableProps<RecordType>["scroll"] | false;
  pagination?: TableProps<RecordType>["pagination"];
  aspirePaginationDefaults?: boolean;
};

function mergeAspirePagination<RecordType extends object>(
  pagination: TableProps<RecordType>["pagination"],
  useDefaults: boolean,
): TableProps<RecordType>["pagination"] {
  if (!useDefaults) return pagination;
  if (pagination === false) return false;
  if (pagination === undefined) return undefined;

  const base = pagination;
  return {
    ...base,
    showSizeChanger: false,
    showTotal: base.showTotal ?? aspirePaginationShowTotal,
    className: ["aspire-custom-pagination", base.className].filter(Boolean).join(" "),
  };
}

function mergeScroll<RecordType extends object>(
  scroll: AspireTableProps<RecordType>["scroll"],
): TableProps<RecordType>["scroll"] | undefined {
  if (scroll === false) return undefined;
  return scroll;
}

function AspireTable<RecordType extends object>(props: AspireTableProps<RecordType>) {
  const {
    className,
    scroll,
    pagination,
    aspirePaginationDefaults = true,
    ...tableProps
  } = props;

  return (
    <Table<RecordType>
      {...tableProps}
      showSorterTooltip={false}
      rowKey={
        tableProps.rowKey ??
        ((record: RecordType & { id?: string; key?: string }) =>
          record?.id?.toString() ?? record?.key?.toString() ?? `row-${Math.random()}`)
      }
      className={["aspire-custom-table", className].filter(Boolean).join(" ")}
      scroll={mergeScroll(scroll)}
      pagination={mergeAspirePagination(pagination, aspirePaginationDefaults)}
    />
  );
}

export default Object.assign(AspireTable, { Summary: Table.Summary });
