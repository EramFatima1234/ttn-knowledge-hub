"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Form, Input, InputNumber, Select, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import AspireButton from "@/components/ui/AspireButton";
import { uploadFile } from "@/hooks/useAdmin";
import {
  useTeamEpisodes,
  useTeamSeries,
  useUploadEpisodeSlot,
} from "@/hooks/useTeamSeries";

export default function TeamSeriesUploadPage() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [seriesId, setSeriesId] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [storageKey, setStorageKey] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const { data: seriesList = [], isLoading: seriesLoading } = useTeamSeries();
  const { data: episodes = [] } = useTeamEpisodes(seriesId);
  const uploadSlot = useUploadEpisodeSlot();

  const selectedSeries = seriesList.find((s) => s.id === seriesId);

  const episodeOptions = useMemo(
    () =>
      episodes.map((ep) => ({
        value: ep.orderIndex,
        label: `Episode ${ep.orderIndex} — ${ep.hasVideo ? ep.title : "Empty slot"}`,
        disabled: false,
      })),
    [episodes],
  );

  useEffect(() => {
    form.setFieldValue("orderIndex", undefined);
  }, [seriesId, form]);

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

    await uploadSlot.mutateAsync({
      seriesId: values.seriesId as string,
      orderIndex: values.orderIndex as number,
      title: values.title as string,
      description: (values.description as string) || undefined,
      durationMinutes: values.durationMinutes as number | undefined,
      videoUrl: videoUrl || undefined,
      storageKey: storageKey || undefined,
      thumbnailUrl: thumbnailUrl || undefined,
    });

    messageApi.success("Episode submitted for admin approval");
    form.resetFields(["title", "description", "durationMinutes", "orderIndex"]);
    setVideoUrl("");
    setStorageKey("");
    setThumbnailUrl("");
  };

  return (
    <div className="kh-page">
      {contextHolder}
      <div className="page_header">
        <div>
          <h1 className="inner_heading pink-border">Series Episode Upload</h1>
          <p>
            Upload your video to the episode number assigned by your admin.
            {selectedSeries && (
              <> Series: <strong>{selectedSeries.title}</strong> ({selectedSeries.uploadedCount}/{selectedSeries.episodeCount} uploaded)</>
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
          name="seriesId"
          label="Knowledge Series"
          rules={[{ required: true, message: "Select the series you were assigned" }]}
        >
          <Select
            loading={seriesLoading}
            placeholder="Select knowledge series"
            options={seriesList.map((s) => ({
              value: s.id,
              label: `${s.title} (${s.uploadedCount}/${s.episodeCount} uploaded)`,
            }))}
            onChange={(value) => setSeriesId(value)}
          />
        </Form.Item>

        <Form.Item
          name="orderIndex"
          label="Episode Number"
          rules={[{ required: true, message: "Select your assigned episode number" }]}
        >
          <Select
            disabled={!seriesId}
            placeholder={seriesId ? "Select episode number" : "Select a series first"}
            options={episodeOptions}
          />
        </Form.Item>

        <Form.Item name="title" label="Episode Title" rules={[{ required: true }]}>
          <Input placeholder="e.g. Introduction to CI/CD Pipelines" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item name="durationMinutes" label="Duration (minutes)">
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Video File" required>
          <Upload beforeUpload={(f) => handleUpload(f, "video")} maxCount={1} accept="video/*">
            <Button icon={<UploadOutlined />} className="secondaryButton aspire-h40">
              Upload Video
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

        <AspireButton htmlType="submit" loading={uploadSlot.isPending}>
          Submit Episode
        </AspireButton>
      </Form>
    </div>
  );
}
