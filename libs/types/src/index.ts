/**
 * @automaker/types
 * Shared type definitions for AutoMaker
 */

// Provider types
export type {
  ProviderConfig,
  ConversationMessage,
  ExecuteOptions,
  ContentBlock,
  ProviderMessage,
  InstallationStatus,
  ValidationResult,
  ModelDefinition,
} from './provider.js';

// Feature types
export type {
  Feature,
  FeatureImagePath,
  FeatureStatus,
  PlanningMode,
} from './feature.js';

// Session types
export type {
  AgentSession,
  SessionListItem,
  CreateSessionParams,
  UpdateSessionParams,
} from './session.js';

// Error types
export type {
  ErrorType,
  ErrorInfo,
} from './error.js';

// Image types
export type {
  ImageData,
  ImageContentBlock,
} from './image.js';

// Model types and constants
export {
  CLAUDE_MODEL_MAP,
  DEFAULT_MODELS,
  type ModelAlias,
} from './model.js';

// Event types
export type {
  EventType,
  EventCallback,
} from './event.js';

// Spec types
export type {
  SpecOutput,
} from './spec.js';
export {
  specOutputSchema,
} from './spec.js';

// Enhancement types
export type {
  EnhancementMode,
  EnhancementExample,
} from './enhancement.js';
