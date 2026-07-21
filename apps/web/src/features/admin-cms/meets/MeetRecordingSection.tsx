"use client";

import { useState } from "react";
import { Button, Tag, Upload, message } from "antd";
import { PlayCircleOutlined, UploadOutlined } from "@ant-design/icons";
import Link from "next/link";
import AspireButton from "@/components/ui/AspireButton";
import CmsFileUploadField from "@/features/admin-cms/components/CmsFileUploadField";
import { uploadFile } from "@/hooks/useAdmin";
import {
  useAdminMeet,
  useUploadAdminMeetRecording,
} from "@/hooks/useAdminCms";
import { runCmsAction } from "@/lib/cms-actions";

interface MeetRecordingSectionProps {
  meetId: string;
}

export default function MeetRecordingSection({ meetId }: MeetRecordingSectionProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const { data: meet, refetch } = useAdminMeet(meetId);
  const uploadRecording = useUploadAdminMeetRecording();
  const [videoUrl, setVideoUrl] = useState("");
  const [storageKey, setStorageKey] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const handleVideoUpload = async (file: File) => {
    const result = await uploadFile(file, "videos");
    setVideoUrl(result);
    setStorageKey(result);
    messageApi.success("Recording uploaded");
    return false;
  };

  const handlePublishRecording = () =>
    runCmsAction(async () => {
      if (!videoUrl && !storageKey && !meet?.hasRecording) {
        messageApi.error("Upload a recording file first");
        return;
      }

      await uploadRecording.mutateAsync({
        meetId,
        videoUrl: videoUrl || undefined,
        storageKey: storageKey || undefined,
        thumbnailUrl: thumbnailUrl || meet?.thumbnailUrl || undefined,
        durationMinutes: meet?.durationMinutes,
        cmsStatus: "PUBLISHED",
      });

      setVideoUrl("");
      setStorageKey("");
      setThumbnailUrl("");
      await refetch();
    }, messageApi, "Recording published to video library");

  if (!meet) return null;

  return (
    <section className="kh-cms-form-section">
      {contextHolder}
      <h2 className="kh-cms-form-section__title">Session recording</h2>
      <p className="kh-cms-form-section__desc">
        Publish the session recording here. It appears in the video library alongside knowledge series.
      </p>

      <div className="kh-cms-recording-status" style={{ marginBottom: 16 }}>
        {meet.hasRecording ? (
          <>
            <Tag color="success">Recording uploaded</Tag>
            {meet.recordingStatus && <Tag>{meet.recordingStatus}</Tag>}
            {meet.videoId && (
              <Link href={`/watch/${meet.videoId}`} className="kh-table-link" style={{ marginLeft: 8 }}>
                <PlayCircleOutlined /> Watch in library
              </Link>
            )}
          </>
        ) : (
          <Tag color="default">No recording yet</Tag>
        )}
      </div>

      <div className="kh-cms-upload-grid" style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <Upload beforeUpload={handleVideoUpload} maxCount={1} accept="video/*">
          <Button icon={<UploadOutlined />} className="secondaryButton aspire-h40">
            {meet.hasRecording ? "Replace Recording" : "Upload Recording"}
          </Button>
        </Upload>
        {videoUrl && <Tag color="processing">New video ready</Tag>}

        <CmsFileUploadField
          label="Thumbnail"
          category="thumbnails"
          accept="image/*"
          preview="thumbnail"
          value={thumbnailUrl || meet.thumbnailUrl}
          onChange={setThumbnailUrl}
          onClear={() => setThumbnailUrl("")}
        />
      </div>

      <AspireButton
        aspireVariant="primary"
        loading={uploadRecording.isPending}
        onClick={handlePublishRecording}
        disabled={!videoUrl && !storageKey && !meet.hasRecording}
      >
        {meet.hasRecording ? "Update & Publish Recording" : "Publish Recording"}
      </AspireButton>
    </section>
  );
}
