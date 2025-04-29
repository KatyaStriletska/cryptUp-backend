export interface DaoMemberDto {
  id: string;
}

export interface CreateDaoDto {
  multisigPda: string;
  vaultPda: string;
  projectLaunch: { id: string };
}

export interface UpdateDaoDto {
  membersToAdd?: DaoMemberDto[];
  membersToRemove?: DaoMemberDto[];
  threshold?: number;
  updatedAt?: Date | null;
  removedAt?: Date | null;
}

export interface BlockchainCreateDaoDto {
  project_id: string;
}

export interface BlockchainAddMemberDto {
  multisig_pda: string;
  pubkey: string;
  permissions: string[];
}

export interface BlockchainRemoveMemberDto {
  multisig_pda: string;
  pubkey: string;
}

export interface BlockchainWithdrawDto {
  multisig_pda: string;
  is_execute: boolean;
  receiver: string;
  amount: Number;
}

export interface BlockchainChangeThresholdDto {
  multisig_pda: string;
  new_threshold: Number;
}

export interface BlockchainExecuteProposalDto {
  multisig_pda: string;
}

export interface BlockchainVoteDto {
  multisig_pda: string;
  voter: string;
  vote: string; // approve cancel
}
