"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Col, Form, Input, Row, Select, message } from "antd";
import {
  createId,
  slugify,
  useAdminCompetencies,
  useAdminSpeakers,
  useSaveSpeaker,
} from "@/hooks/useAdminCms";
import AdminPageHeader from "@/features/admin-cms/components/AdminPageHeader";
import AspireButton from "@/components/ui/AspireButton";
import type { AdminSpeakerRecord } from "@/features/admin-cms/types";
import { runCmsAction } from "@/lib/cms-actions";

interface SpeakerFormPageProps {
  speakerId?: string;
}

export default function SpeakerFormPage({ speakerId }: SpeakerFormPageProps) {
  const router = useRouter();
  const [form] = Form.useForm();
  const { data: speakers = [] } = useAdminSpeakers();
  const existing = speakers.find((item) => item.id === speakerId);
  const { data: competencies = [] } = useAdminCompetencies();
  const saveSpeaker = useSaveSpeaker();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!existing) return;
    form.setFieldsValue({
      ...existing,
      competencyId: existing.competencyId ?? existing.competency?.id,
    });
  }, [existing, form]);

  const handleSave = async () => {
    const ok = await runCmsAction(async () => {
      const values = await form.validateFields();
      const competency = competencies.find((c) => c.id === values.competencyId);
      const record: AdminSpeakerRecord = {
        id: speakerId ?? createId("speaker"),
        slug: existing?.slug ?? slugify(values.name as string),
        name: values.name as string,
        designation: (values.designation as string) || null,
        bio: (values.bio as string) || null,
        linkedinUrl: (values.linkedinUrl as string) || null,
        email: (values.email as string) || null,
        avatarUrl: (values.avatarUrl as string) || null,
        competencyId: (values.competencyId as string) || null,
        competency: competency
          ? { id: competency.id, name: competency.name, slug: competency.slug }
          : null,
        sessionCount: existing?.sessionCount ?? 0,
        source: "cms",
        updatedAt: new Date().toISOString(),
      };
      await saveSpeaker.mutateAsync(record);
    }, messageApi, "Speaker saved");

    if (ok) {
      router.push("/admin/catalog?tab=speakers");
    }
  };

  return (
    <div className="kh-cms-page">
      {contextHolder}
      <AdminPageHeader
        backHref="/admin/catalog?tab=speakers"
        backLabel="Back to Catalog"
        title={speakerId ? "Edit Speaker" : "Add Speaker"}
        description="Add speaker profile details and competency."
      />

      <Form form={form} layout="vertical" className="kh-cms-form">
        <Row gutter={[24, 0]}>
          <Col xs={24} md={12}>
            <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="designation" label="Designation"><Input /></Form.Item>
            <Form.Item name="competencyId" label="Competency">
              <Select
                allowClear
                placeholder="Select competency"
                options={competencies.map((c) => ({ value: c.id, label: c.name }))}
              />
            </Form.Item>
            <Form.Item name="email" label="Email"><Input type="email" /></Form.Item>
            <Form.Item name="linkedinUrl" label="LinkedIn"><Input /></Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="avatarUrl" label="Photo URL"><Input /></Form.Item>
            <Form.Item name="bio" label="Bio"><Input.TextArea rows={6} /></Form.Item>
          </Col>
        </Row>

        <div className="kh-cms-form__actions">
          <AspireButton aspireVariant="primary" onClick={handleSave}>Save Speaker</AspireButton>
        </div>
      </Form>
    </div>
  );
}
