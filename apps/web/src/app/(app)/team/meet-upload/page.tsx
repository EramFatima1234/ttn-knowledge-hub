"use client";

import { useState } from "react";
import { Button, Form, Input, InputNumber, Select, Tag, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import AspireButton from "@/components/ui/AspireButton";
import { uploadFile } from "@/hooks/useAdmin";
import { useTeamMeets, useUploadMeetRecording } from "@/hooks/useTeamMeets";

export default function TeamMeetUploadPage() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [meetId, setMeetId] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [storageKey, setStorageKey] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const { data: meets = [], isLoading: meetsLoading } = useTeamMeets();
  const uploadRecording = useUploadMeetRecording();

  const selectedMeet = meets.find((m) => m.id === meetId);

  const handleUpload = async (file: File, type: "video" | "thumbnail") => {
    const result = await uploadFile(file, type === "video" ? "videos" : "thumbnails");
    if (type === "video") {
      setVideoUrl(result);
      setStorageKey(result);
    } else {
      setThumbnailUrl(result);
    }
    messageApi.success(`${type} uploaded`);
    return false;
  };

  const onFinish = async (values: Record<string, unknown>) => {
    if (!videoUrl && !storageKey) {
      messageApi.error("Please upload a video file first");
      return;
    }

    await uploadRecording.mutateAsync({
      meetId: values.meetId as string,
      title: (values.title as string) || undefined,
      description: (values.description as string) || undefined,
      durationMinutes: values.durationMinutes as number | undefined,
      videoUrl: videoUrl || undefined,
      storageKey: storageKey || undefined,
      thumbnailUrl: thumbnailUrl || undefined,
    });

    messageApi.success("Recording submitted for admin approval");
    form.resetFields(["title", "description", "durationMinutes"]);
    setVideoUrl("");
    setStorageKey("");
    setThumbnailUrl("");
  };

  return (
    <div className="kh-page">
      {contextHolder}
      <div className="page_header">
        <div>
          <h1 className="inner_heading pink-border">Knowledge Meet Recording</h1>
          <p>
            Upload the session recording for a published knowledge meet. Once approved, it appears in
            the video library.
            {selectedMeet && (
              <>
                {" "}
                Session: <strong>{selectedMeet.title}</strong>
                {selectedMeet.hasRecordingUpload && (
                  <Tag color="blue" style={{ marginLeft: 8 }}>
                    {selectedMeet.recordingStatus === "PENDING_APPROVAL"
                      ? "Awaiting approval"
                      : "Recording on file"}
                  </Tag>
                )}
              </>
            )}
          </p>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="kh-upload-form"
        style={{ maxWidth: 640 }}
      >
        <Form.Item
          name="meetId"
          label="Knowledge Meet Session"
          rules={[{ required: true, message: "Select the session you recorded" }]}
        >
          <Select
            loading={meetsLoading}
            placeholder="Select monthly knowledge meet"
            onChange={(value) => setMeetId(value)}
            options={meets.map((m) => ({
              value: m.id,
              label: `${m.title} — ${dayjs(m.scheduledAt).format("MMM D, YYYY")}${
                m.competency ? ` (${m.competency.name})` : ""
              }`,
            }))}
          />
        </Form.Item>

        <Form.Item name="title" label="Recording Title (optional)">
          <Input placeholder="Defaults to the meet session title" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Optional notes for learners" />
        </Form.Item>

        <Form.Item name="durationMinutes" label="Duration (minutes)">
          <InputNumber min={1} style={{ width: "100%" }} placeholder="From session schedule" />
        </Form.Item>

        <Form.Item label="Video File" required>
          <Upload beforeUpload={(f) => handleUpload(f, "video")} maxCount={1} accept="video/*">
            <Button icon={<UploadOutlined />} className="secondaryButton aspire-h40">
              Upload Recording
            </Button>
          </Upload>
          {videoUrl && <p className="kh-upload-url">Video ready</p>}
        </Form.Item>

        <Form.Item label="Thumbnail">
          <Upload beforeUpload={(f) => handleUpload(f, "thumbnail")} maxCount={1} accept="image/*">
            <Button icon={<UploadOutlined />} className="secondaryButton aspire-h40">
              Upload Thumbnail
            </Button>
          </Upload>
        </Form.Item>

        <AspireButton htmlType="submit" loading={uploadRecording.isPending}>
          Submit Recording
        </AspireButton>
      </Form>
    </div>
  );
}
