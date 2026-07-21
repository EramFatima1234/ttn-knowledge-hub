import type {
  AdminCompetencyRecord,
  AdminEpisodeRecord,
  AdminMeetRecord,
  AdminResourceRecord,
  AdminSeriesRecord,
  AdminSpeakerRecord,
  CmsStoreState,
  PlatformSettings,
} from "../types";

const STORAGE_KEY = "kh-admin-cms-v1";

const defaultSettings: PlatformSettings = {
  homepageBannerTitle: "Engineering Knowledge Hub",
  homepageBannerSubtitle: "Learn from internal experts across competencies.",
  homepageBannerImage: "",
  themeAccent: "#DE1186",
  defaultCompetencyId: "",
  emailWelcomeTemplate: "Welcome to KnowledgeHub, {{name}}!",
  notifyNewSession: true,
  notifyApproval: true,
  featureQa: true,
  featureBookmarks: true,
};

const emptyStore = (): CmsStoreState => ({
  meets: [],
  series: [],
  episodes: {},
  resources: [],
  speakers: [],
  competencies: [],
  settings: defaultSettings,
});

function readStore(): CmsStoreState {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    return { ...emptyStore(), ...JSON.parse(raw) };
  } catch {
    return emptyStore();
  }
}

function writeStore(state: CmsStoreState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getCmsStore(): CmsStoreState {
  return readStore();
}

export function saveCmsSettings(settings: PlatformSettings) {
  const store = readStore();
  store.settings = settings;
  writeStore(store);
}

export function upsertMeet(record: AdminMeetRecord) {
  const store = readStore();
  const index = store.meets.findIndex((item) => item.id === record.id);
  if (index >= 0) store.meets[index] = record;
  else store.meets.unshift(record);
  writeStore(store);
}

export function deleteMeet(id: string) {
  const store = readStore();
  store.meets = store.meets.filter((item) => item.id !== id);
  writeStore(store);
}

export function upsertSeries(record: AdminSeriesRecord) {
  const store = readStore();
  const index = store.series.findIndex((item) => item.id === record.id);
  if (index >= 0) store.series[index] = record;
  else store.series.unshift(record);
  writeStore(store);
}

export function deleteSeries(id: string) {
  const store = readStore();
  store.series = store.series.filter((item) => item.id !== id);
  delete store.episodes[id];
  writeStore(store);
}

export function upsertEpisode(record: AdminEpisodeRecord) {
  const store = readStore();
  const list = store.episodes[record.seriesId] ?? [];
  const index = list.findIndex((item) => item.id === record.id);
  if (index >= 0) list[index] = record;
  else list.push(record);
  list.sort((a, b) => a.orderIndex - b.orderIndex);
  store.episodes[record.seriesId] = list;
  writeStore(store);
}

export function deleteEpisode(seriesId: string, episodeId: string) {
  const store = readStore();
  const list = store.episodes[seriesId] ?? [];
  store.episodes[seriesId] = list.filter((item) => item.id !== episodeId);
  writeStore(store);
}

export function reorderEpisodes(seriesId: string, orderedIds: string[]) {
  const store = readStore();
  const list = store.episodes[seriesId] ?? [];
  const map = new Map(list.map((item) => [item.id, item]));
  store.episodes[seriesId] = orderedIds
    .map((id, index) => {
      const episode = map.get(id);
      if (!episode) return null;
      return { ...episode, orderIndex: index + 1 };
    })
    .filter(Boolean) as AdminEpisodeRecord[];
  writeStore(store);
}

export function upsertResource(record: AdminResourceRecord) {
  const store = readStore();
  const index = store.resources.findIndex((item) => item.id === record.id);
  if (index >= 0) store.resources[index] = record;
  else store.resources.unshift(record);
  writeStore(store);
}

export function deleteResource(id: string) {
  const store = readStore();
  store.resources = store.resources.filter((item) => item.id !== id);
  writeStore(store);
}

export function upsertSpeaker(record: AdminSpeakerRecord) {
  const store = readStore();
  const index = store.speakers.findIndex((item) => item.id === record.id);
  if (index >= 0) store.speakers[index] = record;
  else store.speakers.unshift(record);
  writeStore(store);
}

export function deleteSpeaker(id: string) {
  const store = readStore();
  store.speakers = store.speakers.filter((item) => item.id !== id);
  writeStore(store);
}

export function upsertCompetency(record: AdminCompetencyRecord) {
  const store = readStore();
  const index = store.competencies.findIndex((item) => item.id === record.id);
  if (index >= 0) store.competencies[index] = record;
  else store.competencies.unshift(record);
  writeStore(store);
}

export function deleteCompetency(id: string) {
  const store = readStore();
  store.competencies = store.competencies.filter((item) => item.id !== id);
  writeStore(store);
}

export function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
