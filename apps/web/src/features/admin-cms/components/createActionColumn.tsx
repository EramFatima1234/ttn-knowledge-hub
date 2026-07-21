import type { ColumnsType } from "antd/es/table";
import AspireTableActions, { type TableActionItem } from "./AspireTableActions";

export function createActionColumn<T extends object>(
  getItems: (record: T, index: number) => TableActionItem[],
): NonNullable<ColumnsType<T>[number]> {
  return {
    title: "Action",
    key: "action",
    width: 80,
    fixed: "right",
    align: "center",
    render: (_, record, index) => <AspireTableActions items={getItems(record, index)} />,
  };
}
