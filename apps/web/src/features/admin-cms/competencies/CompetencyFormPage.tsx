"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Col, Form, Input, Row, message } from "antd";
import {
  createId,
  slugify,
  useAdminCompetencies,
  useSaveCompetency,
} from "@/hooks/useAdminCms";
import AdminPageHeader from "@/features/admin-cms/components/AdminPageHeader";
import AspireButton from "@/components/ui/AspireButton";
import type { AdminCompetencyRecord } from "@/features/admin-cms/types";
import { runCmsAction } from "@/lib/cms-actions";

interface CompetencyFormPageProps {
  competencyId?: string;
}

export default function CompetencyFormPage({ competencyId }: CompetencyFormPageProps) {
  const router = useRouter();
  const [form] = Form.useForm();
  const { data: competencies = [] } = useAdminCompetencies();
  const existing = competencies.find((item) => item.id === competencyId);
  const saveCompetency = useSaveCompetency();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!existing) return;
    form.setFieldsValue(existing);
  }, [existing, form]);

  const handleSave = async () => {
    const ok = await runCmsAction(async () => {
      const values = await form.validateFields();
      const record: AdminCompetencyRecord = {
        id: competencyId ?? createId("competency"),
        name: values.name as string,
        slug: existing?.slug ?? slugify(values.name as string),
        description: null,
        icon: (values.icon as string) || "📚",
        sessionCount: existing?.sessionCount ?? 0,
        seriesCount: existing?.seriesCount ?? 0,
        resourceCount: existing?.resourceCount ?? 0,
        source: "cms",
        updatedAt: new Date().toISOString(),
      };
      await saveCompetency.mutateAsync(record);
    }, messageApi, "Competency saved");

    if (ok) {
      router.push("/admin/catalog?tab=competencies");
    }
  };

  return (
    <div className="kh-cms-page">
      {contextHolder}
      <AdminPageHeader
        backHref="/admin/catalog?tab=competencies"
        backLabel="Back to Catalog"
        title={competencyId ? "Edit Competency" : "Add Competency"}
        description="Define competency metadata for content tagging."
      />

      <Form form={form} layout="vertical" className="kh-cms-form" initialValues={{ icon: "📚" }}>
        <Row gutter={[24, 0]}>
          <Col xs={24} md={12}>
            <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="icon" label="Icon"><Input placeholder="📚" /></Form.Item>
          </Col>
        </Row>

        <div className="kh-cms-form__actions">
          <AspireButton aspireVariant="primary" onClick={handleSave}>Save Competency</AspireButton>
        </div>
      </Form>
    </div>
  );
}
