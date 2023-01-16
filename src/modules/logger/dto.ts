export interface LoggerAnalyticDto {
  text: string;
}

export interface LoggerDebugDto {
  path: string;
  data?: Record<string, unknown>;
}

export interface LoggerErrorDto {
  path: string;
  code?: string;
  data: Record<string, unknown>;
}
