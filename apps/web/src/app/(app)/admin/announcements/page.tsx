"use client";

import { useState } from "react";
import { Button, Form, Input, InputNumber, List, Switch, message } from "antd";
import AspireButton from "@/components/ui/AspireButton";
import AspireModal from "@/components/ui/AspireModal";
import {
  useAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
} from "@/hooks/useAdmin";

export default function AdminAnnouncementsPage() {
  const { data, isLoading } = useAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const onCreate = async (values: {
    title: string;
    body: string;
    priority: number;
    isActive: boolean;
  }) => {
    await createAnnouncement.mutateAsync(values);
    messageApi.success("Announcement created");
    setOpen(false);
    form.resetFields();
  };

  return (
    <div className="kh-page">
      {contextHolder}
      <div className="page_header">
        <h1 className="inner_heading pink-border">Announcements</h1>
        <AspireButton onClick={() => setOpen(true)}>New Announcement</AspireButton>
      </div>

      <List
        loading={isLoading}
        dataSource={data ?? []}
        locale={{ emptyText: "No announcements yet." }}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                key="delete"
                danger
                size="small"
                onClick={() => deleteAnnouncement.mutate(item.id)}
              >
                Delete
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={item.title}
              description={item.body}
            />
          </List.Item>
        )}
      />

      <AspireModal
        title="Create Announcement"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createAnnouncement.isPending}
      >
        <Form form={form} layout="vertical" onFinish={onCreate}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="body" label="Body" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="priority" label="Priority" initialValue={0}>
            <InputNumber min={0} max={10} />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked" initialValue>
            <Switch />
          </Form.Item>
        </Form>
      </AspireModal>
    </div>
  );
}
