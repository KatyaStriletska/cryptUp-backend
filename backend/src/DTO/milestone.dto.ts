export interface CreateMilestoneDto {
  mergedPullRequestUrl: string;
  description: string;
  projectId: string;
}

export interface UpdateMilestoneDto {
  mergedPullRequestUrl?: string;
  isFinal?: boolean;
  description?: string;
  isWithdrawn?: boolean;
  transactionApprovalHash?: string;
}
