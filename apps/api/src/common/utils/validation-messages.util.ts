import { ValidationError } from 'class-validator';

const FIELD_LABELS: Record<string, string> = {
  title: 'Title',
  description: 'Description',
  competencyId: 'Competency',
  thumbnailUrl: 'Cover image',
  episodeCount: 'Number of episodes',
  plannedEpisodeCount: 'Number of episodes',
  orderIndex: 'Episode number',
  durationMinutes: 'Duration',
  videoUrl: 'Video',
  storageKey: 'Video file',
  cmsStatus: 'Status',
};

function labelFor(field: string): string {
  return FIELD_LABELS[field] ?? 'This field';
}

function formatConstraint(field: string, constraint: string): string {
  const label = labelFor(field);

  if (constraint.includes('should not exist')) {
    return 'Something in the form could not be saved. Please refresh the page and try again.';
  }
  if (constraint.includes('must be an integer') || constraint.includes('is not an integer')) {
    return `${label} must be a whole number.`;
  }
  if (constraint.includes('must not be less than')) {
    if (field === 'episodeCount' || field === 'plannedEpisodeCount') {
      return 'Number of episodes must be at least 1.';
    }
    if (field === 'orderIndex') {
      return 'Episode number must be at least 1.';
    }
    return `${label} is too small.`;
  }
  if (constraint.includes('must be a UUID')) {
    return `Please choose a valid ${label.toLowerCase()}.`;
  }
  if (constraint.includes('should not be empty') || constraint.includes('must be a string')) {
    return `${label} is required.`;
  }

  return `${label} is not valid. Please check and try again.`;
}

function flattenErrors(errors: ValidationError[], parent = ''): string[] {
  const messages: string[] = [];

  for (const error of errors) {
    const field = parent ? `${parent}.${error.property}` : error.property;
    const key = error.property;

    if (error.constraints) {
      for (const constraint of Object.values(error.constraints)) {
        messages.push(formatConstraint(key, constraint));
      }
    }

    if (error.children?.length) {
      messages.push(...flattenErrors(error.children, field));
    }
  }

  return messages;
}

export function formatValidationErrors(errors: ValidationError[]): string {
  const messages = flattenErrors(errors);
  return messages[0] ?? 'Please check the form and try again.';
}
