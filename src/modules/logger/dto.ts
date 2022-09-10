export interface LoggerErrorDto {
  path: string;
  code?: string;
  data: Record<string, unknown>;
}
