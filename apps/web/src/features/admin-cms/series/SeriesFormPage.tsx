"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Col, Form, Input, InputNumber, Row, Select, message } from "antd";
import {
  createId,
  useAdminCompetencies,
  useAdminSeriesItem,
  useAdminSpeakers,
  useSaveSeries,
} from "@/hooks/useAdminCms";
import AdminPageHeader from "@/features/admin-cms/components/AdminPageHeader";
import CmsUrlField from "@/features/admin-cms/components/CmsUrlField";
import {
  CmsTagsField,
  DisplayPriorityField,
  HomepageSectionsField,
} from "@/features/admin-cms/components/CmsMetadataFields";
import AspireButton from "@/components/ui/AspireButton";
import type { AdminSeriesRecord, CmsPublishStatus, SeriesLevel } from "@/features/admin-cms/types";
import { runCmsAction } from "@/lib/cms-actions";

interface SeriesFormPageProps {
  seriesId?: string;
}

export default function SeriesFormPage({ seriesId }: SeriesFormPageProps) {
  const router = useRouter();
  const [form] = Form.useForm();
  const { data: existing } = useAdminSeriesItem(seriesId ?? "");
  const { data: speakers = [] } = useAdminSpeakers();
  const { data: competencies = [] } = useAdminCompetencies();
  const saveSeries = useSaveSeries();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!existing) return;
    form.setFieldsValue({
      ...existing,
      instructorId: existing.instructorId ?? existing.instructor?.id,
      competencyId: existing.competencyId ?? existing.competency?.id,
      plannedEpisodeCount: existing.plannedEpisodeCount ?? existing.episodeCount,
      tags: existing.tags ?? [],
      homepageTags: existing.homepageTags ?? [],
      displayPriority: existing.displayPriority ?? 100,
    });
  }, [existing, form]);

  const buildRecord = (values: Record<string, unknown>, status: CmsPublishStatus): AdminSeriesRecord => {
    const instructor = speakers.find((s) => s.id === values.instructorId);
    const competency = competencies.find((c) => c.id === values.competencyId);

    return {
      id: seriesId ?? createId("series"),
      title: values.title as string,
      description: (values.description as string) || null,
      instructorId: values.instructorId as string | undefined,
      instructor: instructor ? { id: instructor.id, name: instructor.name, designation: instructor.designation, avatarUrl: instructor.avatarUrl } : null,
      competencyId: values.competencyId as string | undefined,
      competency: competency ? { id: competency.id, name: competency.name, slug: competency.slug } : null,
      level: values.level as SeriesLevel,
      bannerUrl: (values.bannerUrl as string) || null,
      thumbnailUrl: (values.thumbnailUrl as string) || null,
      estimatedDurationMinutes: values.estimatedDurationMinutes as number | undefined,
      tags: (values.tags as string[]) ?? [],
      homepageTags: (values.homepageTags as string[]) ?? [],
      displayPriority: (values.displayPriority as number) ?? 100,
      plannedEpisodeCount: values.plannedEpisodeCount as number | undefined,
      episodeCount: existing?.episodeCount ?? 0,
      viewCount: existing?.viewCount ?? 0,
      status,
      source: "cms",
      updatedAt: new Date().toISOString(),
    };
  };

  const handleSave = async (status: CmsPublishStatus) => {
    let savedId = seriesId;

    const ok = await runCmsAction(async () => {
      const values = await form.validateFields();
      const record = buildRecord(values, status);
      const saved = await saveSeries.mutateAsync({ ...record, cmsStatus: status });
      savedId = saved.id;
    }, messageApi, status === "PUBLISHED" ? "Series published" : "Series saved");

    if (ok && savedId) {
      router.push(`/admin/series/${savedId}/episodes`);
    }
  };

  return (
    <div className="kh-cms-page">
      {contextHolder}
      <AdminPageHeader
        backHref="/admin/content?tab=series"
        backLabel="Back to Content"
        title={seriesId ? "Edit Knowledge Series" : "Add Knowledge Series"}
        description="Define series metadata with URL-based media. Episodes use video and resource URLs."
        actionLabel={seriesId ? "Manage Episodes" : undefined}
        actionHref={seriesId ? `/admin/series/${seriesId}/episodes` : undefined}
      />

      <Form form={form} layout="vertical" className="kh-cms-form" initialValues={{ level: "INTERMEDIATE", displayPriority: 100 }}>
        <section className="kh-cms-form-section">
          <h2 className="kh-cms-form-section__title">Basic information</h2>
          <Row gutter={[24, 0]}>
            <Col xs={24} lg={16}>
              <Form.Item name="title" label="Series title" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={4} />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item name="competencyId" label="Competency">
                <Select allowClear options={competencies.map((c) => ({ value: c.id, label: c.name }))} />
              </Form.Item>
              <Form.Item name="instructorId" label="Instructor">
                <Select allowClear options={speakers.map((s) => ({ value: s.id, label: s.name }))} />
              </Form.Item>
              <Form.Item name="level" label="Difficulty">
                <Select options={[
                  { value: "BEGINNER", label: "Beginner" },
                  { value: "INTERMEDIATE", label: "Intermediate" },
                  { value: "ADVANCED", label: "Advanced" },
                ]} />
              </Form.Item>
              <Form.Item name="estimatedDurationMinutes" label="Estimated duration (min)">
                <InputNumber min={15} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="plannedEpisodeCount"
                label="Number of episodes"
                extra="Pre-creates episode slots for URL-based episode content."
              >
                <InputNumber min={1} max={100} style={{ width: "100%" }} placeholder="e.g. 7" />
              </Form.Item>
            </Col>
          </Row>
        </section>

        <section className="kh-cms-form-section">
          <h2 className="kh-cms-form-section__title">Media</h2>
          <Row gutter={[24, 0]}>
            <Col xs={24} lg={12}>
              <CmsUrlField name="bannerUrl" label="Banner URL" helperText="Recommended size 1600×900." previewMode="image" />
            </Col>
            <Col xs={24} lg={12}>
              <CmsUrlField name="thumbnailUrl" label="Cover image URL" helperText="Recommended size 1280×720." previewMode="image" />
            </Col>
          </Row>
        </section>

        <section className="kh-cms-form-section">
          <h2 className="kh-cms-form-section__title">Tags &amp; homepage</h2>
          <Row gutter={[24, 0]}>
            <Col xs={24} lg={12}><CmsTagsField /></Col>
            <Col xs={24} lg={12}><HomepageSectionsField /></Col>
            <Col xs={24} lg={8}><DisplayPriorityField /></Col>
          </Row>
        </section>

        <section className="kh-cms-form-section">
          <h2 className="kh-cms-form-section__title">Publishing</h2>
          <p className="kh-cms-form-section__desc">
            Published series appear on the series page, search, and homepage sections you select above.
          </p>
        </section>

        <div className="kh-cms-form__actions">
          <AspireButton onClick={() => handleSave("DRAFT")}>Save</AspireButton>
          <AspireButton aspireVariant="primary" onClick={() => handleSave("PUBLISHED")}>Publish</AspireButton>
        </div>
      </Form>
    </div>
  );
}
