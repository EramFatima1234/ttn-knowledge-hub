"use client";

import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

interface CmsFilterSearchProps {
  placeholder: string;
  onSearch: (value: string) => void;
}

export default function CmsFilterSearch({ placeholder, onSearch }: CmsFilterSearchProps) {
  return (
    <Input
      allowClear
      placeholder={placeholder}
      prefix={<SearchOutlined />}
      className="kh-cms-filter-search"
      onChange={(e) => onSearch(e.target.value)}
    />
  );
}
