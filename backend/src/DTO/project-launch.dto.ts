export interface CreateProjectLaunchDto {
  name: string;
  description: string;
  logo: string | null;
  fundraiseAmount: number;
  fundraiseDeadline: Date;
  projectDocuments: string[];
  team: any;
  businessModel: string;
  tokenomics: string;
  roundDetails: any;
  authorId: string;
  vaultTokenAccount: string;
  cryptoTrackerAccount: string;
}

export interface UpdateProjectLaunchDto {
  name?: string;
  description?: string;
  logo?: string | null;
  isFundraised?: boolean;
  approverId?: string;
  fundraiseAmount?: number;
  fundraiseProgress?: number;
  fundraiseDeadline?: Date;
  projectDocuments?: string[];
  team?: any;
  businessModel?: string;
  tokenomics?: string;
  roundDetails?: any;
  vaultTokenAccount?: string;
  cryptoTrackerAccount?: string;
  businessAnalystReview?: string | null;
}
