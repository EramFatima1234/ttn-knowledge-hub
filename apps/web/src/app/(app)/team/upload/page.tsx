"use client";

import { useState } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  Table,
  Tag,
  Upload,
  message,
} from "antd";
import AspireButton from "@/components/ui/AspireButton";
import { UploadOutlined } from "@ant-design/icons";
import {
  uploadFile,
  useCreateVideo,
  useMyUploads,
  useSubmitVideo,
} from "@/hooks/useAdmin";
import { useCompetencies, useCategories } from "@/hooks/useTaxonomy";

export default function TeamUploadPage() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const { data: uploads, isLoading } = useMyUploads();
  const { data: competencies } = useCompetencies();
  const { data: categories } = useCategories();
  const createVideo = useCreateVideo();
  const submitVideo = useSubmitVideo();

  const handleUpload = async (file: File, type: "video" | "thumbnail") => {
    const url = await uploadFile(file, type === "video" ? "videos" : "thumbnails");
    if (type === "video") setVideoUrl(url);
    else setThumbnailUrl(url);
    messageApi.success(`${type} uploaded`);
    return false;
  };

  const onFinish = async (values: Record<string, string>) => {
    const result = await createVideo.mutateAsync({
      ...values,
      videoUrl: videoUrl || undefined,
      thumbnailUrl: thumbnailUrl || undefined,
    });
    messageApi.success("Draft created");
    form.resetFields();
    setVideoUrl("");
    setThumbnailUrl("");
    return result;
  };

  const handleSubmit = async (id: string) => {
    await submitVideo.mutateAsync(id);
    messageApi.success("Submitted for approval");
  };

  return (
    <div className="kh-page">
      {contextHolder}
      <div className="page_header">
        <div>
          <h1 className="inner_heading pink-border">Upload Content</h1>
          <p>Create a draft and submit for admin approval.</p>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="kh-upload-form"
      >
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="competencyId" label="Competency">
          <Select
            allowClear
            options={competencies?.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
          />
        </Form.Item>
        <Form.Item name="categoryId" label="Category">
          <Select
            allowClear
            options={categories?.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
          />
        </Form.Item>
        <Form.Item label="Video File">
          <Upload beforeUpload={(f) => handleUpload(f, "video")} maxCount={1}>
            <Button icon={<UploadOutlined />} className="secondaryButton aspire-h40">
              Upload Video
            </Button>
          </Upload>
          {videoUrl && <p className="kh-upload-url">{videoUrl}</p>}
        </Form.Item>
        <Form.Item label="Thumbnail">
          <Upload
            beforeUpload={(f) => handleUpload(f, "thumbnail")}
            maxCount={1}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />} className="secondaryButton aspire-h40">
              Upload Thumbnail
            </Button>
          </Upload>
          {thumbnailUrl && <p className="kh-upload-url">{thumbnailUrl}</p>}
        </Form.Item>
        <AspireButton htmlType="submit" loading={createVideo.isPending}>
          Save Draft
        </AspireButton>
      </Form>

      <h2 style={{ marginTop: 40 }}>My Uploads</h2>
      <Table
        className="aspire-custom-table"
        loading={isLoading}
        rowKey="id"
        dataSource={uploads ?? []}
        columns={[
          { title: "Title", dataIndex: "title" },
          {
            title: "Status",
            dataIndex: "status",
            render: (s: string) => <Tag>{s}</Tag>,
          },
          {
            title: "Actions",
            render: (_, record) =>
              record.status === "DRAFT" ? (
                <AspireButton
                  aspireVariant="secondary"
                  size="small"
                  onClick={() => handleSubmit(record.id)}
                >
                  Submit for Approval
                </AspireButton>
              ) : null,
          },
        ]}
      />
    </div>
  );
}
