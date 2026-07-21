"use client";

import { Tabs, Spin, List } from "antd";
import Link from "next/link";
import Image from "next/image";
import {
  useBookmarks,
  useContinueWatching,
  useWatchHistory,
} from "@/hooks/useContent";
import { ContentType } from "@knowledgehub/types";
import { resolveThumbnailUrl } from "@/lib/content-images";

function contentHref(contentType: ContentType, contentId: string) {
  if (contentType === ContentType.VIDEO) return `/watch/${contentId}`;
  if (contentType === ContentType.KNOWLEDGE_MEET) return `/meets/${contentId}`;
  return `/series/${contentId}`;
}

export default function LibraryPage() {
  const { data: continueWatching, isLoading: loadingContinue } =
    useContinueWatching();
  const { data: history, isLoading: loadingHistory } = useWatchHistory();
  const { data: bookmarks, isLoading: loadingBookmarks } = useBookmarks();

  const renderHistoryList = (
    items: typeof continueWatching,
    loading: boolean,
    emptyText: string,
  ) => {
    if (loading) {
      return (
        <div className="kh-auth-loading">
          <Spin />
        </div>
      );
    }

    return (
      <List
        dataSource={items ?? []}
        locale={{ emptyText }}
        renderItem={(item) => (
          <List.Item>
            <Link href={`/watch/${item.contentId}`} className="kh-library-item">
              <Image
                src={resolveThumbnailUrl(item.thumbnailUrl)}
                alt={item.title}
                width={120}
                height={68}
                className="kh-library-item__thumb"
              />
              <div>
                <strong>{item.title}</strong>
                <p>{item.progressPercent}% watched</p>
              </div>
            </Link>
          </List.Item>
        )}
      />
    );
  };

  return (
    <div className="kh-page">
      <div className="page_header">
        <div>
          <h1 className="inner_heading pink-border">Library</h1>
          <p>Your bookmarks, watch history, and continue watching.</p>
        </div>
      </div>

      <Tabs
        items={[
          {
            key: "continue",
            label: "Continue Watching",
            children: renderHistoryList(
              continueWatching,
              loadingContinue,
              "Nothing in progress. Start watching a video!",
            ),
          },
          {
            key: "bookmarks",
            label: "Bookmarks",
            children: loadingBookmarks ? (
              <Spin />
            ) : (
              <List
                dataSource={bookmarks ?? []}
                locale={{ emptyText: "No bookmarks yet." }}
                renderItem={(item) => (
                  <List.Item>
                    <Link
                      href={contentHref(item.contentType, item.contentId)}
                      className="kh-library-item"
                    >
                      <Image
                        src={resolveThumbnailUrl(item.thumbnailUrl)}
                        alt={item.title}
                        width={120}
                        height={68}
                      />
                      <div>
                        <strong>{item.title}</strong>
                        {item.subtitle && <p>{item.subtitle}</p>}
                      </div>
                    </Link>
                  </List.Item>
                )}
              />
            ),
          },
          {
            key: "history",
            label: "History",
            children: renderHistoryList(
              history,
              loadingHistory,
              "No watch history yet.",
            ),
          },
        ]}
      />
    </div>
  );
}
