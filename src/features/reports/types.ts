export type ReportReason =
  | "spam"
  | "copyright"
  | "inappropriate"
  | "impersonation"
  | "other";

export type ReportStatus = "pending" | "resolved" | "dismissed";

export interface SubmitReportInput {
  username: string;
  projectSlug?: string;
  reason: ReportReason;
  description?: string;
}

export interface ReportItem {
  id: string;
  reporterIpHash: string;
  profileId: string;
  projectId: string | null;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  resolvedBy: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
}
