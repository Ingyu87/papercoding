export const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export const MAX_PROMPT_LENGTH = 2_000;
export const MAX_PREVIOUS_HTML_LENGTH = 200_000;
export const GENERATION_CUTOFF_AT = Date.parse("2026-07-25T15:00:00.000Z");
