import { BN } from "@coral-xyz/anchor";

export interface NftMetadataInterface{
    id: BN;
    name: string;
    symbol: string;
    uri: string;
}