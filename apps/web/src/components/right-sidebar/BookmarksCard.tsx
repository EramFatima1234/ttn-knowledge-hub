"use client";

import Image from "next/image";
import Link from "next/link";
import { Empty } from "antd";
import { BookOutlined, PlayCircleOutlined } from "@ant-design/icons";
import SidebarSection from "@/components/right-sidebar/SidebarSection";
import { useRightSidebarBookmarks } from "@/hooks/useRightSidebar";
import { resolveThumbnailUrl } from "@/lib/content-images";

export default function BookmarksCard({ contentOnly = false }: { contentOnly?: boolean }) {
  const { bookmarks, isLoading, isError, refetch } = useRightSidebarBookmarks();

  return (
    <SidebarSection
      title="Recently Bookmarked"
      icon="⭐"
      contentOnly={contentOnly}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => void refetch()}
      delay={0.25}
      action={
        contentOnly ? undefined : (
          <Link href="/explore" className="kh-rs-section__link">
            View All
          </Link>
        )
      }
    >
      {bookmarks.length === 0 ? (
        <div className="kh-rs-empty kh-rs-empty--illustrated">
          <BookOutlined className="kh-rs-empty__icon" />
          <p>No bookmarks yet</p>
          <Link href="/explore">Discover content</Link>
        </div>
      ) : (
        <div className="kh-rs-card kh-rs-bookmarks">
          {bookmarks.map((item) => (
            <div key={item.id} className="kh-rs-bookmark">
              <div className="kh-rs-bookmark__thumb">
                <Image
                  src={resolveThumbnailUrl(item.thumbnailUrl)}
                  alt=""
                  width={64}
                  height={40}
                  unoptimized
                />
              </div>
              <div className="kh-rs-bookmark__body">
                <strong>{item.title}</strong>
                {item.seriesLabel && (
                  <small className="kh-rs-bookmark__series">{item.seriesLabel}</small>
                )}
                {item.durationLabel && (
                  <small className="kh-rs-bookmark__duration">{item.durationLabel}</small>
                )}
              </div>
              <Link href={item.href} className="kh-rs-bookmark__continue">
                <PlayCircleOutlined /> Continue
              </Link>
            </div>
          ))}
        </div>
      )}
    </SidebarSection>
  );
}
