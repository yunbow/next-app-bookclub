export interface ActionError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  fieldErrors?: Record<string, string[]>;
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: ActionError };
