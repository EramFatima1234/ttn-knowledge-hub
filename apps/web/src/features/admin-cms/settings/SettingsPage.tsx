"use client";

import { useEffect } from "react";
import { Col, Form, Input, Row, Select, message } from "antd";
import {
  useAdminCompetencies,
  usePlatformSettings,
  useSavePlatformSettings,
} from "@/hooks/useAdminCms";
import AdminPageHeader from "@/features/admin-cms/components/AdminPageHeader";
import AspireButton from "@/components/ui/AspireButton";

export default function SettingsPage() {
  const [form] = Form.useForm();
  const { data: settings } = usePlatformSettings();
  const { data: competencies = [] } = useAdminCompetencies();
  const saveSettings = useSavePlatformSettings();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (settings) form.setFieldsValue(settings);
  }, [settings, form]);

  const handleSave = async () => {
    const values = await form.validateFields();
    await saveSettings.mutateAsync(values);
    messageApi.success("Settings saved");
  };

  return (
    <div className="kh-cms-page">
      {contextHolder}
      <AdminPageHeader
        title="Settings"
        description="Homepage banner and theme defaults for the platform."
      />

      <Form form={form} layout="vertical" className="kh-cms-form">
        <section className="kh-cms-panel">
          <h2>Homepage Banner</h2>
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}><Form.Item name="homepageBannerTitle" label="Title"><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="homepageBannerImage" label="Banner Image URL"><Input /></Form.Item></Col>
            <Col xs={24}><Form.Item name="homepageBannerSubtitle" label="Subtitle"><Input /></Form.Item></Col>
          </Row>
        </section>

        <section className="kh-cms-panel">
          <h2>Theme & Defaults</h2>
          <Row gutter={[24, 0]}>
            <Col xs={24} md={8}><Form.Item name="themeAccent" label="Theme Accent"><Input /></Form.Item></Col>
            <Col xs={24} md={8}>
              <Form.Item name="defaultCompetencyId" label="Default Competency">
                <Select allowClear options={competencies.map((c) => ({ value: c.id, label: c.name }))} />
              </Form.Item>
            </Col>
          </Row>
        </section>

        <div className="kh-cms-form__actions">
          <AspireButton aspireVariant="primary" onClick={handleSave}>Save Settings</AspireButton>
        </div>
      </Form>
    </div>
  );
}
