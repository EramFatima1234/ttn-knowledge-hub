"use client";

import { useState } from "react";
import { Card, Form, Input, List, Progress, Select, Steps, message } from "antd";
import AspireButton from "@/components/ui/AspireButton";
import {
  useCreateVideo,
  useMyUploads,
  uploadFile,
} from "@/hooks/useAdmin";
import { useCompetencies } from "@/hooks/useTaxonomy";
import { fetchApiJson } from "@/lib/api";

const STEPS = [
  { title: "Details" },
  { title: "Media" },
  { title: "Resources" },
  { title: "Visibility" },
  { title: "Review" },
  { title: "Publish" },
];

export default function TeamStudioPage() {
  const [step, setStep] = useState(0);
  const [form] = Form.useForm();
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [draftVideoId, setDraftVideoId] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const { data: uploads } = useMyUploads();
  const { data: competencies = [] } = useCompetencies();
  const createVideo = useCreateVideo();

  const autosave = async () => {
    const values = form.getFieldsValue();
    await fetchApiJson("studio/drafts/VIDEO", {
      method: "PUT",
      body: JSON.stringify({
        step: STEPS[step].title.toLowerCase(),
        contentId: draftVideoId ?? "",
        payload: { ...values, videoUrl, thumbnailUrl },
      }),
    });
  };

  const handleUpload = async (file: File, type: "video" | "thumbnail") => {
    setUploadProgress(10);
    const url = await uploadFile(file, type === "video" ? "videos" : "thumbnails");
    setUploadProgress(100);
    if (type === "video") setVideoUrl(url);
    else setThumbnailUrl(url);
    await autosave();
    return false;
  };

  const saveDraft = async () => {
    const values = await form.validateFields().catch(() => null);
    if (!values) return;
    const result = await createVideo.mutateAsync({
      ...values,
      videoUrl: videoUrl || undefined,
      thumbnailUrl: thumbnailUrl || undefined,
    });
    setDraftVideoId(result.data.id);
    messageApi.success("Draft saved");
    await autosave();
  };

  return (
    <div className="kh-studio">
      {contextHolder}
      <div className="page_header">
        <h1 className="inner_heading pink-border">Upload Studio</h1>
        <p>YouTube Studio-style flow with autosave and step validation.</p>
      </div>

      <Steps current={step} items={STEPS} className="kh-studio__steps" />

      <Card className="kh-studio__panel">
        {step === 0 && (
          <Form form={form} layout="vertical">
            <Form.Item name="title" label="Title" rules={[{ required: true }]}>
              <Input onBlur={autosave} />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={4} onBlur={autosave} />
            </Form.Item>
            <Form.Item name="competencyId" label="Competency">
              <Select
                allowClear
                placeholder="Select competency"
                options={competencies.map((c) => ({
                  label: c.name,
                  value: c.id,
                }))}
                onChange={autosave}
              />
            </Form.Item>
          </Form>
        )}

        {step === 1 && (
          <div>
            <p>Upload video and thumbnail. Progress: {uploadProgress}%</p>
            <Progress percent={uploadProgress} />
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file, "video");
              }}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file, "thumbnail");
              }}
            />
            {videoUrl && <p className="kh-upload-url">{videoUrl}</p>}
          </div>
        )}

        {step === 2 && (
          <p>Add GitHub, slides, PDFs, and documentation links after publish from the watch page resource center, or attach via API.</p>
        )}

        {step === 3 && (
          <p>Visibility defaults to internal review workflow. Submit for admin approval on the final step.</p>
        )}

        {step === 4 && (
          <div>
            <h3>Review</h3>
            <pre>{JSON.stringify(form.getFieldsValue(), null, 2)}</pre>
            <p>Video: {videoUrl || "—"}</p>
            <p>Thumbnail: {thumbnailUrl || "—"}</p>
          </div>
        )}

        {step === 5 && (
          <AspireButton
            onClick={async () => {
              await saveDraft();
              if (draftVideoId) {
                await fetchApiJson(`studio/videos/${draftVideoId}/publish`, {
                  method: "POST",
                });
                messageApi.success("Submitted for review");
              }
            }}
            loading={createVideo.isPending}
          >
            Save Draft & Submit for Review
          </AspireButton>
        )}
      </Card>

      <div className="kh-studio__nav">
        <AspireButton
          aspireVariant="secondary"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Back
        </AspireButton>
        <AspireButton
          onClick={async () => {
            await autosave();
            setStep((s) => Math.min(STEPS.length - 1, s + 1));
          }}
        >
          Next
        </AspireButton>
      </div>

      <h2>My Drafts</h2>
      <List
        dataSource={uploads ?? []}
        renderItem={(item) => (
          <List.Item>
            <strong>{item.title}</strong> — {item.status}
          </List.Item>
        )}
      />
    </div>
  );
}
