/**
 * Error handling utilities and types
 * Based on guidelines: docs/guidelines/21_error.md
 */

// Error codes taxonomy
export const ERROR_CODES = {
  // Authentication & Authorization (401, 403)
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Validation errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Resource errors (404, 409)
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Business logic errors (400, 409)
  DOMAIN_ERROR: 'DOMAIN_ERROR',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // System errors (500, 503)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// Extended ActionResult type with error details
export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: {
    code: ErrorCode;
    message: string;
    retryable?: boolean;
    requestId?: string;
    details?: Record<string, unknown>;
  };
}

// Domain error class for business logic violations
export class DomainError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public retryable: boolean = false,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

// Helper functions to create ActionResult responses
export function success<T>(data?: T): ActionResult<T> {
  return {
    success: true,
    data,
  };
}

export function failure<T = void>(
  code: ErrorCode,
  message: string,
  retryable: boolean = false,
  requestId?: string,
  details?: Record<string, unknown>
): ActionResult<T> {
  return {
    success: false,
    error: {
      code,
      message,
      retryable,
      requestId,
      details,
    },
  };
}

// Convert Error to ActionResult
export function errorToActionResult<T = void>(
  error: unknown,
  requestId?: string
): ActionResult<T> {
  if (error instanceof DomainError) {
    return failure(error.code, error.message, error.retryable, requestId, error.details);
  }

  if (error instanceof Error) {
    // Check for Prisma errors
    if ('code' in error) {
      const prismaCode = (error as any).code;
      
      // P2002: Unique constraint violation
      if (prismaCode === 'P2002') {
        return failure(
          ERROR_CODES.ALREADY_EXISTS,
          'このリソースは既に存在します',
          false,
          requestId
        );
      }
      
      // P2025: Record not found
      if (prismaCode === 'P2025') {
        return failure(
          ERROR_CODES.NOT_FOUND,
          'リソースが見つかりません',
          false,
          requestId
        );
      }

      // Other Prisma errors
      return failure(
        ERROR_CODES.DATABASE_ERROR,
        'データベースエラーが発生しました',
        true,
        requestId
      );
    }

    return failure(
      ERROR_CODES.INTERNAL_ERROR,
      'エラーが発生しました。時間を置いて再度お試しください。',
      true,
      requestId
    );
  }

  return failure(
    ERROR_CODES.INTERNAL_ERROR,
    '予期しないエラーが発生しました',
    true,
    requestId
  );
}

// HTTP status code mapping
export function errorCodeToHttpStatus(code: ErrorCode): number {
  switch (code) {
    case ERROR_CODES.UNAUTHORIZED:
    case ERROR_CODES.SESSION_EXPIRED:
      return 401;
    
    case ERROR_CODES.FORBIDDEN:
      return 403;
    
    case ERROR_CODES.NOT_FOUND:
      return 404;
    
    case ERROR_CODES.ALREADY_EXISTS:
    case ERROR_CODES.CONFLICT:
    case ERROR_CODES.DOMAIN_ERROR:
      return 409;
    
    case ERROR_CODES.VALIDATION_ERROR:
    case ERROR_CODES.INVALID_INPUT:
    case ERROR_CODES.MISSING_REQUIRED_FIELD:
    case ERROR_CODES.OPERATION_NOT_ALLOWED:
      return 400;
    
    case ERROR_CODES.RATE_LIMIT_EXCEEDED:
      return 429;
    
    case ERROR_CODES.SERVICE_UNAVAILABLE:
    case ERROR_CODES.EXTERNAL_API_ERROR:
      return 503;
    
    case ERROR_CODES.INTERNAL_ERROR:
    case ERROR_CODES.DATABASE_ERROR:
    default:
      return 500;
  }
}
