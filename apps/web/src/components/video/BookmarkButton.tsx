"use client";

import React, { useEffect, useState } from "react";
import { BookOutlined, BookFilled } from "@ant-design/icons";
import { ContentType } from "@knowledgehub/types";
import { useToggleBookmark } from "@/hooks/useContent";
import AspireButton from "@/components/ui/AspireButton";

interface BookmarkButtonProps {
  contentType: ContentType;
  contentId: string;
  isBookmarked?: boolean;
}

export default function BookmarkButton({
  contentType,
  contentId,
  isBookmarked = false,
}: BookmarkButtonProps) {
  const toggle = useToggleBookmark();
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  useEffect(() => {
    setBookmarked(isBookmarked);
  }, [isBookmarked]);

  const handleClick = async () => {
    const result = await toggle.mutateAsync({ contentType, contentId });
    setBookmarked(result.data.bookmarked);
  };

  return (
    <AspireButton
      aspireVariant="secondary"
      icon={bookmarked ? <BookFilled /> : <BookOutlined />}
      onClick={handleClick}
      loading={toggle.isPending}
    >
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </AspireButton>
  );
}
