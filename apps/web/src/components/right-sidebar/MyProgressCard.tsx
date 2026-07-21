"use client";

import Link from "next/link";
import { Empty, Progress } from "antd";
import {
  BookOutlined,
  ClockCircleOutlined,
  FireOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import AspireButton from "@/components/ui/AspireButton";
import SidebarSection from "@/components/right-sidebar/SidebarSection";
import AnimatedNumber from "@/components/right-sidebar/AnimatedNumber";
import { useRightSidebarProgress } from "@/hooks/useRightSidebar";

export default function MyProgressCard() {
  const { progress, isLoading, isError, refetch } = useRightSidebarProgress();

  return (
    <SidebarSection
      title="My Learning"
      icon="👤"
      isLoading={isLoading}
      isError={isError}
      onRetry={() => void refetch()}
      skeletonRows={4}
      delay={0}
    >
      {!progress ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Start watching to track progress"
          className="kh-rs-empty"
        />
      ) : (
        <div className="kh-rs-card kh-rs-progress">
          <div className="kh-rs-progress__streak">
            <FireOutlined />
            <AnimatedNumber value={progress.streakDays} />
            <span>Day Streak</span>
          </div>

          <div className="kh-rs-progress__stats">
            <div className="kh-rs-progress__stat">
              <BookOutlined className="kh-rs-progress__stat-icon" />
              <div>
                <small>Completed</small>
                <strong>
                  <AnimatedNumber value={progress.completedSessions} /> Sessions
                </strong>
              </div>
            </div>
            <div className="kh-rs-progress__stat">
              <ClockCircleOutlined className="kh-rs-progress__stat-icon" />
              <div>
                <small>Hours</small>
                <strong>
                  <AnimatedNumber value={progress.hoursWatched} decimals={1} suffix="h" />
                </strong>
              </div>
            </div>
          </div>

          <div className="kh-rs-progress__goal">
            <div className="kh-rs-progress__goal-head">
              <span>
                <TrophyOutlined /> Weekly Goal
              </span>
              <strong>
                <AnimatedNumber value={progress.weeklyGoalPercent} suffix="%" />
              </strong>
            </div>
            <Progress
              percent={progress.weeklyGoalPercent}
              showInfo={false}
              strokeColor="#DE1186"
              trailColor="#f3e8ef"
              size="small"
            />
          </div>

          <Link href={progress.continueHref}>
            <AspireButton block className="kh-rs-progress__cta">
              Continue Learning
            </AspireButton>
          </Link>
        </div>
      )}
    </SidebarSection>
  );
}
