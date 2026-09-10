/**
// ─────────────────────────────────────────────
// Normalized AI Error Hierarchy
// ─────────────────────────────────────────────
*/

export class AIProviderNotConfiguredError extends Error {
  constructor(message = "AI provider is not configured on this server.") {
    super(message);
    this.name = "AIProviderNotConfiguredError";
  }
}

export class AIVisionModelNotConfiguredError extends Error {
  constructor(message = "Vision-capable model is not configured for image analysis.") {
    super(message);
    this.name = "AIVisionModelNotConfiguredError";
  }
}

export class AIAuthError extends Error {
  constructor(message = "AI provider authorization failed. Check your API key.") {
    super(message);
    this.name = "AIAuthError";
  }
}

export class AIRateLimitError extends Error {
  constructor(message = "AI provider rate limit reached. Please wait a moment.") {
    super(message);
    this.name = "AIRateLimitError";
  }
}

export class AIRequestError extends Error {
  constructor(message = "Invalid request to AI model.") {
    super(message);
    this.name = "AIRequestError";
  }
}

export class AIProviderUnavailableError extends Error {
  constructor(message = "AI provider is temporarily unavailable.") {
    super(message);
    this.name = "AIProviderUnavailableError";
  }
}
