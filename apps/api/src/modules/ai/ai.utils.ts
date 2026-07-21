export function parseModelJson<T>(raw: string): T {
  const trimmed = raw.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonText = fence ? fence[1].trim() : trimmed;
  return JSON.parse(jsonText) as T;
}

export function contentHref(
  type: string,
  id: string,
  slug?: string | null,
): string {
  switch (type) {
    case 'VIDEO':
      return `/watch/${id}`;
    case 'KNOWLEDGE_MEET':
      return `/meets/${id}`;
    case 'KNOWLEDGE_SERIES':
      return `/series/${id}`;
    case 'SPEAKER':
      return `/speakers/${slug ?? id}`;
    case 'COMPETENCY':
      return `/competencies/${slug ?? id}`;
    default:
      return `/explore`;
  }
}
