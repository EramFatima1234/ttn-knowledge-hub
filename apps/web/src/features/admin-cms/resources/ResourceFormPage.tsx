"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Col, Form, Input, Row, Select, message } from "antd";
import {
  createId,
  useAdminCompetencies,
  useAdminResources,
  useSaveResource,
} from "@/hooks/useAdminCms";
import AdminPageHeader from "@/features/admin-cms/components/AdminPageHeader";
import AspireButton from "@/components/ui/AspireButton";
import type { AdminResourceRecord, CmsPublishStatus, ResourceType } from "@/features/admin-cms/types";
import { runCmsAction } from "@/lib/cms-actions";

interface ResourceFormPageProps {
  resourceId?: string;
}

export default function ResourceFormPage({ resourceId }: ResourceFormPageProps) {
  const router = useRouter();
  const [form] = Form.useForm();
  const { data: resources = [] } = useAdminResources();
  const existing = resources.find((item) => item.id === resourceId);
  const { data: competencies = [] } = useAdminCompetencies();
  const saveResource = useSaveResource();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!existing) return;
    form.setFieldsValue({
      ...existing,
      competencyId: existing.competencyId ?? existing.competency?.id,
    });
  }, [existing, form]);

  const buildRecord = (values: Record<string, unknown>, status: CmsPublishStatus): AdminResourceRecord => {
    const competency = competencies.find((c) => c.id === values.competencyId);
    return {
      id: resourceId ?? createId("resource"),
      title: values.title as string,
      description: (values.description as string) || null,
      competencyId: values.competencyId as string | undefined,
      competency: competency ? { id: competency.id, name: competency.name, slug: competency.slug } : null,
      resourceType: values.resourceType as ResourceType,
      fileUrl: (values.fileUrl as string) || null,
      externalUrl: (values.externalUrl as string) || null,
      thumbnailUrl: (values.thumbnailUrl as string) || null,
      downloadCount: existing?.downloadCount ?? 0,
      status,
      source: "cms",
      updatedAt: new Date().toISOString(),
    };
  };

  const handleSave = async (status: CmsPublishStatus) => {
    const ok = await runCmsAction(async () => {
      const values = await form.validateFields();
      await saveResource.mutateAsync({ ...buildRecord(values, status), cmsStatus: status });
    }, messageApi, status === "PUBLISHED" ? "Resource published" : "Resource saved");

    if (ok) {
      router.push("/admin/content?tab=resources");
    }
  };

  return (
    <div className="kh-cms-page">
      {contextHolder}
      <AdminPageHeader title={resourceId ? "Edit Resource" : "Create Resource"} description="Upload files or link external learning materials." />

      <Form form={form} layout="vertical" className="kh-cms-form" initialValues={{ resourceType: "PDF" }}>
        <Row gutter={[24, 0]}>
          <Col xs={24} md={12}>
            <Form.Item name="title" label="Title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item name="competencyId" label="Competency">
              <Select allowClear options={competencies.map((c) => ({ value: c.id, label: c.name }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="resourceType" label="Resource Type" rules={[{ required: true }]}>
              <Select options={["PDF", "SLIDES", "GITHUB", "ZIP", "EXTERNAL", "DOCUMENTATION"].map((v) => ({ value: v, label: v }))} />
            </Form.Item>
            <Form.Item name="fileUrl" label="Upload File URL">
              <Input placeholder="https://..." />
            </Form.Item>
            <Form.Item name="externalUrl" label="External URL">
              <Input placeholder="https://..." />
            </Form.Item>
            <Form.Item name="thumbnailUrl" label="Thumbnail URL">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <div className="kh-cms-form__actions">
          <AspireButton onClick={() => handleSave("DRAFT")}>Save Draft</AspireButton>
          <AspireButton aspireVariant="primary" onClick={() => handleSave("PUBLISHED")}>Publish</AspireButton>
        </div>
      </Form>
    </div>
  );
}
