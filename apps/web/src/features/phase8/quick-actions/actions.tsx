import {
  BarChartOutlined,
  CalendarOutlined,
  NotificationOutlined,
  PlaySquareOutlined,
  TagsOutlined,
  TeamOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { QuickAction } from "@/features/phase8/widgets";

export const userQuickActions: QuickAction[] = [
  {
    id: "explore",
    title: "Explore Content",
    description: "Browse competencies and sessions",
    href: "/explore",
    icon: <PlaySquareOutlined />,
  },
];

export const teamQuickActions: QuickAction[] = [
  {
    id: "meet-upload",
    title: "Meet Recording Upload",
    description: "Upload a knowledge meet session recording",
    href: "/team/meet-upload",
    icon: <CalendarOutlined />,
  },
  {
    id: "series-upload",
    title: "Series Episode Upload",
    description: "Upload your video to an assigned episode slot",
    href: "/team/series-upload",
    icon: <PlaySquareOutlined />,
  },
  {
    id: "upload",
    title: "Upload Session",
    description: "Publish a new engineering session",
    href: "/team/studio",
    icon: <UploadOutlined />,
  },
  {
    id: "meets",
    title: "Knowledge Meets",
    description: "Browse monthly competency sessions",
    href: "/meets",
    icon: <CalendarOutlined />,
  },
  {
    id: "series",
    title: "Add Knowledge Series",
    description: "Bundle sessions into a series",
    href: "/series",
    icon: <PlaySquareOutlined />,
  },
  {
    id: "reports",
    title: "View Reports",
    description: "Track upload performance",
    href: "/admin/analytics",
    icon: <BarChartOutlined />,
  },
];

export const adminQuickActions: QuickAction[] = [
  {
    id: "users",
    title: "Manage Users",
    description: "Assign roles and access",
    href: "/admin/platform?tab=users",
    icon: <TeamOutlined />,
  },
  {
    id: "competency",
    title: "Add Competency",
    description: "Organize learning taxonomy",
    href: "/explore",
    icon: <TagsOutlined />,
  },
  {
    id: "speaker",
    title: "Add Speaker",
    description: "Manage speaker profiles",
    href: "/admin/catalog?tab=speakers",
    icon: <UserOutlined />,
  },
  {
    id: "announcements",
    title: "Announcements",
    description: "Broadcast platform updates",
    href: "/admin/announcements",
    icon: <NotificationOutlined />,
  },
  {
    id: "reports",
    title: "View Reports",
    description: "Platform insights and trends",
    href: "/admin/reports",
    icon: <BarChartOutlined />,
  },
  {
    id: "homepage",
    title: "Homepage Builder",
    description: "Curate featured content",
    href: "/admin/homepage-builder",
    icon: <BarChartOutlined />,
  },
];
