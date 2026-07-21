"use client";

import { Form, InputNumber, Select } from "antd";
import {
  CMS_CONTENT_TAG_PRESETS,
  HOMEPAGE_SECTION_OPTIONS,
} from "@/features/admin-cms/constants/homepage-tags";

interface CmsTagsFieldProps {
  name?: string;
  label?: string;
}

export function CmsTagsField({
  name = "tags",
  label = "Content tags",
}: CmsTagsFieldProps) {
  return (
    <Form.Item
      name={name}
      label={label}
      extra="Assign topics learners can search and filter by."
    >
      <Select
        mode="tags"
        placeholder="Select or type tags"
        options={CMS_CONTENT_TAG_PRESETS.map((tag) => ({ value: tag.toLowerCase(), label: tag }))}
      />
    </Form.Item>
  );
}

interface HomepageSectionsFieldProps {
  name?: string;
}

export function HomepageSectionsField({ name = "homepageTags" }: HomepageSectionsFieldProps) {
  return (
    <Form.Item
      name={name}
      label="Homepage sections"
      extra="Control where this item can appear on the homepage (sorted by display priority)."
    >
      <Select
        mode="multiple"
        placeholder="Select homepage sections"
        options={HOMEPAGE_SECTION_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
      />
    </Form.Item>
  );
}

export function DisplayPriorityField({ name = "displayPriority" }: { name?: string }) {
  return (
    <Form.Item
      name={name}
      label="Display priority"
      extra="Lower numbers appear first within each homepage section."
      initialValue={100}
    >
      <InputNumber min={1} max={9999} style={{ width: "100%" }} />
    </Form.Item>
  );
}
