export interface CreateProjectLaunchInvestmentDto {
  investorId: string;
  projectLaunchId: string;
}

export interface UpdateProjectLaunchInvestmentDto {
  amount?: number;
}
