"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  message,
} from "antd";
import dayjs from "dayjs";
import {
  createId,
  useAdminCompetencies,
  useAdminMeet,
  useAdminSpeakers,
  useSaveMeet,
} from "@/hooks/useAdminCms";
import AdminPageHeader from "@/features/admin-cms/components/AdminPageHeader";
import CmsUrlField from "@/features/admin-cms/components/CmsUrlField";
import {
  CmsTagsField,
  DisplayPriorityField,
  HomepageSectionsField,
} from "@/features/admin-cms/components/CmsMetadataFields";
import AspireButton from "@/components/ui/AspireButton";
import type { AdminMeetRecord, CmsPublishStatus, MeetDifficulty } from "@/features/admin-cms/types";
import { runCmsAction } from "@/lib/cms-actions";

interface MeetFormPageProps {
  meetId?: string;
}

export default function MeetFormPage({ meetId }: MeetFormPageProps) {
  const router = useRouter();
  const [form] = Form.useForm();
  const { data: existing } = useAdminMeet(meetId ?? "");
  const { data: speakers = [] } = useAdminSpeakers();
  const { data: competencies = [] } = useAdminCompetencies();
  const saveMeet = useSaveMeet();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!existing) return;
    form.setFieldsValue({
      ...existing,
      sessionDate: dayjs(existing.scheduledAt),
      githubRepo: existing.githubRepo,
      slidesUrl: existing.slidesUrl,
      recordingUrl: existing.recordingUrl,
      pdfResourceUrl: existing.pdfResources?.[0],
      externalResourceUrls: (existing.externalResourceUrls ?? []).join(", "),
      tags: existing.tags ?? [],
      homepageTags: existing.homepageTags ?? [],
      displayPriority: existing.displayPriority ?? 100,
    });
  }, [existing, form]);

  const buildRecord = (
    values: Record<string, unknown>,
    status: CmsPublishStatus,
    id: string,
  ): AdminMeetRecord => {
    const sessionDate = values.sessionDate as dayjs.Dayjs;
    const scheduledAt = sessionDate.hour(12).minute(0).second(0).toISOString();
    const speaker = speakers.find((s) => s.id === values.speakerId);
    const competency = competencies.find((c) => c.id === values.competencyId);
    const externalRaw = (values.externalResourceUrls as string) ?? "";
    const externalResourceUrls = externalRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      id,
      title: values.title as string,
      subtitle: (values.subtitle as string) || null,
      description: (values.description as string) || null,
      speakerId: values.speakerId as string,
      speaker: speaker
        ? {
            id: speaker.id,
            name: speaker.name,
            designation: speaker.designation,
            avatarUrl: speaker.avatarUrl,
          }
        : null,
      competencyId: values.competencyId as string,
      competency: competency
        ? { id: competency.id, name: competency.name, slug: competency.slug }
        : null,
      scheduledAt,
      durationMinutes: values.durationMinutes as number,
      bannerUrl: (values.bannerUrl as string) || null,
      thumbnailUrl: (values.thumbnailUrl as string) || null,
      recordingUrl: (values.recordingUrl as string) || null,
      githubRepo: (values.githubRepo as string) || null,
      slidesUrl: (values.slidesUrl as string) || null,
      pdfResources: (values.pdfResourceUrl as string)
        ? [(values.pdfResourceUrl as string)]
        : [],
      externalResourceUrls,
      difficulty: values.difficulty as MeetDifficulty,
      tags: (values.tags as string[]) ?? [],
      homepageTags: (values.homepageTags as string[]) ?? [],
      displayPriority: (values.displayPriority as number) ?? 100,
      attendanceType: "ONLINE",
      status,
      source: "cms",
      updatedAt: new Date().toISOString(),
    };
  };

  const handleSave = async (status: CmsPublishStatus) => {
    const ok = await runCmsAction(async () => {
      const values = await form.validateFields();

      if (status === "PUBLISHED" && !values.recordingUrl) {
        messageApi.error("Recording URL is required to publish");
        return;
      }
      if (status === "PUBLISHED" && !values.bannerUrl) {
        messageApi.error("Banner image URL is required to publish");
        return;
      }
      if (status === "PUBLISHED" && !values.thumbnailUrl) {
        messageApi.error("Thumbnail URL is required to publish");
        return;
      }

      const id = meetId ?? createId("meet");
      const record = buildRecord(values, status, id);
      await saveMeet.mutateAsync({ ...record, cmsStatus: status });
    }, messageApi, status === "PUBLISHED" ? "Session published to library" : "Draft saved");

    if (ok) {
      router.push("/admin/content?tab=meets");
    }
  };

  return (
    <div className="kh-cms-page kh-cms-meet-form">
      {contextHolder}
      <AdminPageHeader
        backHref="/admin/content?tab=meets"
        backLabel="Back to Content"
        title={meetId ? "Edit Knowledge Meet" : "Add Knowledge Meet"}
        description="Manage session metadata and media URLs. Storage-provider agnostic — paste links from YouTube, Vimeo, S3, CloudFront, or any CDN."
      />

      <Form
        form={form}
        layout="vertical"
        className="kh-cms-form"
        initialValues={{ durationMinutes: 60, difficulty: "INTERMEDIATE", displayPriority: 100 }}
      >
        <section className="kh-cms-form-section">
          <h2 className="kh-cms-form-section__title">Basic information</h2>
          <Row gutter={[32, 0]}>
            <Col xs={24} lg={15}>
              <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                <Input placeholder="e.g. React 19 Deep Dive" />
              </Form.Item>
              <Form.Item name="subtitle" label="Subtitle">
                <Input placeholder="Optional subtitle" />
              </Form.Item>
              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: "Description is required" }]}
              >
                <Input.TextArea rows={5} placeholder="What will learners take away from this session?" />
              </Form.Item>
            </Col>
            <Col xs={24} lg={9}>
              <Form.Item name="speakerId" label="Speaker" rules={[{ required: true }]}>
                <Select placeholder="Select speaker" options={speakers.map((s) => ({ value: s.id, label: s.name }))} />
              </Form.Item>
              <Form.Item name="competencyId" label="Competency" rules={[{ required: true }]}>
                <Select placeholder="Select competency" options={competencies.map((c) => ({ value: c.id, label: c.name }))} />
              </Form.Item>
              <Form.Item name="sessionDate" label="Session Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="durationMinutes" label="Duration (minutes)" rules={[{ required: true }]}>
                <InputNumber min={15} step={15} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="difficulty" label="Difficulty" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: "BEGINNER", label: "Beginner" },
                    { value: "INTERMEDIATE", label: "Intermediate" },
                    { value: "ADVANCED", label: "Advanced" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </section>

        <section className="kh-cms-form-section">
          <h2 className="kh-cms-form-section__title">Media</h2>
          <p className="kh-cms-form-section__desc">
            Paste public URLs for artwork and the session recording. Previews appear when the link is valid.
          </p>
          <Row gutter={[24, 0]}>
            <Col xs={24} lg={12}>
              <CmsUrlField
                name="bannerUrl"
                label="Banner image URL"
                helperText="Recommended size 1600×900."
                previewMode="image"
              />
            </Col>
            <Col xs={24} lg={12}>
              <CmsUrlField
                name="thumbnailUrl"
                label="Thumbnail image URL"
                helperText="Recommended size 1280×720."
                previewMode="image"
              />
            </Col>
            <Col xs={24}>
              <CmsUrlField
                name="recordingUrl"
                label="Recording URL"
                helperText="Paste a YouTube, Vimeo, or direct MP4 link."
                previewMode="video"
              />
            </Col>
          </Row>
        </section>

        <section className="kh-cms-form-section">
          <h2 className="kh-cms-form-section__title">Resources</h2>
          <Row gutter={[24, 0]}>
            <Col xs={24} lg={12}>
              <CmsUrlField name="slidesUrl" label="Slides URL" previewMode="pdf" />
            </Col>
            <Col xs={24} lg={12}>
              <CmsUrlField name="pdfResourceUrl" label="PDF resource URL" previewMode="pdf" />
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item name="githubRepo" label="GitHub repository URL">
                <Input placeholder="https://github.com/org/repo" />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                name="externalResourceUrls"
                label="External resource URLs"
                extra="Comma-separated list of additional links."
              >
                <Input placeholder="https://..., https://..." />
              </Form.Item>
            </Col>
          </Row>
        </section>

        <section className="kh-cms-form-section">
          <h2 className="kh-cms-form-section__title">Tags &amp; homepage</h2>
          <Row gutter={[24, 0]}>
            <Col xs={24} lg={12}>
              <CmsTagsField />
            </Col>
            <Col xs={24} lg={12}>
              <HomepageSectionsField />
            </Col>
            <Col xs={24} lg={8}>
              <DisplayPriorityField />
            </Col>
          </Row>
        </section>

        <section className="kh-cms-form-section">
          <h2 className="kh-cms-form-section__title">Publishing</h2>
          <p className="kh-cms-form-section__desc">
            Save as draft while preparing content. Published sessions appear in the library, search, speaker and competency pages, and homepage sections you selected above.
          </p>
        </section>

        <div className="kh-cms-form__actions">
          <AspireButton onClick={() => handleSave("DRAFT")}>Save Draft</AspireButton>
          <AspireButton aspireVariant="primary" onClick={() => handleSave("PUBLISHED")}>
            Publish to Library
          </AspireButton>
        </div>
      </Form>
    </div>
  );
}
