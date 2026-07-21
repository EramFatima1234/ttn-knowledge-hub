const FIELD_LABELS: Record<string, string> = {
  plannedEpisodeCount: "Number of episodes",
  episodeCount: "Number of episodes",
  orderIndex: "Episode number",
  title: "Title",
  competencyId: "Competency",
};

export function humanizeApiErrorMessage(message: string): string {
  if (message.includes("should not exist")) {
    return "Something in the form could not be saved. Please refresh the page and try again.";
  }

  for (const [field, label] of Object.entries(FIELD_LABELS)) {
    if (message.includes(field)) {
      if (message.includes("must be an integer") || message.includes("is not an integer")) {
        return `${label} must be a whole number.`;
      }
      if (message.includes("must not be less than")) {
        return `${label} must be at least 1.`;
      }
      if (message.includes("should not be empty")) {
        return `${label} is required.`;
      }
    }
  }

  if (message.includes("must be a UUID")) {
    return "Please choose a valid option from the dropdown.";
  }

  if (message.includes("Authentication required") || message.includes("Unauthorized")) {
    return "Please sign in again to continue.";
  }

  if (message.includes("Internal server error")) {
    return "Something went wrong on our side. Please try again in a moment.";
  }

  return message;
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof Error && error.message) {
    return humanizeApiErrorMessage(error.message);
  }
  return fallback;
}
