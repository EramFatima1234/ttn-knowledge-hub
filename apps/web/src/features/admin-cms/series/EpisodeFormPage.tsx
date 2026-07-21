"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Col, Form, Input, InputNumber, Row, Select, message } from "antd";
import {
  createId,
  useAdminEpisodes,
  useSaveEpisode,
} from "@/hooks/useAdminCms";
import AdminPageHeader from "@/features/admin-cms/components/AdminPageHeader";
import CmsUrlField from "@/features/admin-cms/components/CmsUrlField";
import AspireButton from "@/components/ui/AspireButton";
import type { AdminEpisodeRecord, CmsPublishStatus } from "@/features/admin-cms/types";
import { runCmsAction } from "@/lib/cms-actions";

interface EpisodeFormPageProps {
  seriesId: string;
  episodeId?: string;
}

export default function EpisodeFormPage({ seriesId, episodeId }: EpisodeFormPageProps) {
  const router = useRouter();
  const [form] = Form.useForm();
  const { data: episodes = [] } = useAdminEpisodes(seriesId);
  const existing = episodes.find((item) => item.id === episodeId);
  const saveEpisode = useSaveEpisode();
  const [messageApi, contextHolder] = message.useMessage();

  const episodeOptions = useMemo(
    () =>
      episodes.map((ep) => ({
        value: ep.orderIndex,
        label: `Episode ${ep.orderIndex}${ep.hasVideo ? " (has video)" : " (empty)"}`,
      })),
    [episodes],
  );

  useEffect(() => {
    if (!existing) return;
    form.setFieldsValue({
      ...existing,
      resources: (existing.resources ?? []).join(", "),
    });
  }, [existing, form]);

  const buildRecord = (values: Record<string, unknown>, status: CmsPublishStatus): AdminEpisodeRecord => ({
    id: episodeId ?? createId("episode"),
    seriesId,
    orderIndex: (values.orderIndex as number) ?? existing?.orderIndex ?? episodes.length + 1,
    title: values.title as string,
    description: (values.description as string) || null,
    durationMinutes: values.durationMinutes as number | undefined,
    videoUrl: (values.videoUrl as string) || null,
    storageKey: null,
    thumbnailUrl: (values.thumbnailUrl as string) || null,
    githubRepo: (values.githubRepo as string) || null,
    slidesUrl: (values.slidesUrl as string) || null,
    pdfUrl: (values.pdfUrl as string) || null,
    resources: (values.resources as string)?.split(",").map((s) => s.trim()).filter(Boolean) ?? [],
    status,
    updatedAt: new Date().toISOString(),
  });

  const handleSave = async (status: CmsPublishStatus) => {
    const ok = await runCmsAction(async () => {
      const values = await form.validateFields();
      if (status === "PUBLISHED" && !values.videoUrl) {
        messageApi.error("Video URL is required to publish");
        return;
      }
      await saveEpisode.mutateAsync({ ...buildRecord(values, status), cmsStatus: status });
    }, messageApi, status === "PUBLISHED" ? "Episode published" : "Episode saved");

    if (ok) {
      router.push(`/admin/series/${seriesId}/episodes`);
    }
  };

  return (
    <div className="kh-cms-page">
      {contextHolder}
      <AdminPageHeader
        backHref={`/admin/series/${seriesId}/episodes`}
        backLabel="Back to Episodes"
        title={episodeId ? "Edit Episode" : "Add Episode"}
        description="Paste video and resource URLs for this episode slot."
      />

      <Form form={form} layout="vertical" className="kh-cms-form">
        <section className="kh-cms-form-section">
          <h2 className="kh-cms-form-section__title">Basic information</h2>
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              {!episodeId && (
                <Form.Item
                  name="orderIndex"
                  label="Episode number"
                  rules={[{ required: true, message: "Select which episode slot to fill" }]}
                >
                  <Select
                    placeholder="Select episode number"
                    options={
                      episodeOptions.length > 0
                        ? episodeOptions
                        : [{ value: episodes.length + 1, label: `Episode ${episodes.length + 1}` }]
                    }
                  />
                </Form.Item>
              )}
              <Form.Item name="title" label="Episode title" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={4} />
              </Form.Item>
              <Form.Item name="durationMinutes" label="Duration (minutes)">
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <CmsUrlField
                name="videoUrl"
                label="Video URL"
                helperText="YouTube, Vimeo, or direct MP4."
                previewMode="video"
              />
              <CmsUrlField
                name="thumbnailUrl"
                label="Thumbnail URL"
                previewMode="image"
              />
            </Col>
          </Row>
        </section>

        <section className="kh-cms-form-section">
          <h2 className="kh-cms-form-section__title">Resources</h2>
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <CmsUrlField name="slidesUrl" label="Slides URL" previewMode="pdf" />
            </Col>
            <Col xs={24} md={12}>
              <CmsUrlField name="pdfUrl" label="PDF URL" previewMode="pdf" />
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="githubRepo" label="GitHub URL">
                <Input placeholder="https://github.com/org/repo" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="resources" label="Additional resource URLs" extra="Comma-separated.">
                <Input placeholder="https://..., https://..." />
              </Form.Item>
            </Col>
          </Row>
        </section>

        <div className="kh-cms-form__actions">
          <AspireButton onClick={() => handleSave("DRAFT")}>Save Draft</AspireButton>
          <AspireButton aspireVariant="primary" onClick={() => handleSave("PUBLISHED")}>Publish</AspireButton>
        </div>
      </Form>
    </div>
  );
}
