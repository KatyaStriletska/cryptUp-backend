import { BN, Program, AnchorProvider, Wallet, web3, AnchorError } from '@coral-xyz/anchor';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Connection,
  Commitment,
  Transaction,
} from '@solana/web3.js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';
import { ProjectLaunchInvestment } from '../../types/project-launch-investment.interface';
import { NftMetadataInterface } from '../../types/nftMetadat.interface';
import { ThirdwebStorage } from '@thirdweb-dev/storage';

const PROGRAM_ID = new PublicKey('3WY8hNmU4RWTm5CSR1okJVAMqbtVMWeR9DLGYtuVNtGr'); // TODO: add here import from env
import { Metaplex } from '@metaplex-foundation/js';
import { error } from 'console';

interface OffChainMetadata {
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}
interface FindNftsResult {
  nftMintAddresses: PublicKey[];
  totalInvestmentAmount: BN;
}

export class NftMintService {
  async burnAndVesting(investorAddress: string, projectName: string, tokenAddress: string) {
    // 1. find NFTS
    console.log('Find NFT.');
    const result: FindNftsResult = await findAllNftForInvestor(investorAddress, projectName);
    if (!result || result.nftMintAddresses.length == 0) {
      console.log('No nfts');
      throw error('No nft');
      //   return;
    }
    console.log(result);
    const investAmount = result.totalInvestmentAmount;
    const nfts = result.nftMintAddresses;
    // 2. make instruction for burn NFT
    console.log('Burn NFT.');
    const burnNftsInstruction = await burnNFTs(nfts, investorAddress);
    if (!burnNftsInstruction || burnNftsInstruction.length === 0) {
      console.error('No birn nfts instruction.');
      return;
    }
    console.log(burnNftsInstruction);
    // 3. start vesting
    const vestingInstruction = await startVestingTokens(
      tokenAddress,
      investorAddress,
      investAmount,
    );
    if (!vestingInstruction) {
      console.error('No vesting instruction.');
      return;
    }
    const transaction = new Transaction();
    for (const burnIntsr of burnNftsInstruction) {
      transaction.add(burnIntsr);
    }
    transaction.add(vestingInstruction);
    transaction.feePayer = new web3.PublicKey(investorAddress);
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed' as Commitment);

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    const BA_PRIVATE_KEY = process.env.BA_PRIVATE_KEY;
    if (!BA_PRIVATE_KEY) {
      console.error("BA_PRIVATE_KEY wasn't find");
      throw new Error('BA_PRIVATE_KEY is missing.');
    }
    const secretKeyArray = BA_PRIVATE_KEY.split(',').map(n => Number(n.trim()));
    const mintAuthorityKeypair = Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));

    transaction.partialSign(mintAuthorityKeypair);
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
    });
    const base64Transaction = serializedTransaction.toString('base64');
    return base64Transaction;
  }
  async startTeamVesting(beneficiaryAddress: string, tokenAddress: string) {
    const investAmount = new BN(100);

    const vestingInstruction = await startVestingTokens(
      tokenAddress,
      beneficiaryAddress,
      investAmount,
    );
    if (!vestingInstruction) {
      console.error('No vesting instruction.');
      return;
    }
    const transaction = new Transaction();
    transaction.add(vestingInstruction);
    transaction.feePayer = new web3.PublicKey(beneficiaryAddress);
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed' as Commitment);

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    const BA_PRIVATE_KEY = process.env.BA_PRIVATE_KEY;
    if (!BA_PRIVATE_KEY) {
      console.error("BA_PRIVATE_KEY wasn't find");
      throw new Error('BA_PRIVATE_KEY is missing.');
    }
    const secretKeyArray = BA_PRIVATE_KEY.split(',').map(n => Number(n.trim()));
    const mintAuthorityKeypair = Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));

    transaction.partialSign(mintAuthorityKeypair);
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
    });
    const base64Transaction = serializedTransaction.toString('base64');
    return base64Transaction;
  }

  async createProjectToken(tokenName: string, tokenSymbol: string, imageUri: string) {
    const BA_PRIVATE_KEY = process.env.BA_PRIVATE_KEY;
    if (!BA_PRIVATE_KEY) {
      console.error("BA_PRIVATE_KEY wasn't find");
      process.exit(1);
    } else {
      console.log('BA_PRIVATE_KEY was found');
    }
    const secretKeyArray = BA_PRIVATE_KEY.split(',').map(n => Number(n.trim()));
    const payerKeypair = Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));
    const payerWallet = new Wallet(payerKeypair);

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed' as Commitment);

    const provider = new AnchorProvider(
      connection,
      payerWallet,
      { commitment: 'confirmed' }, // anchor.AnchorProvider.defaultOptions()
    );

    const filePathIdl = path.resolve(__dirname, 'idlToken.json');
    if (!fs.existsSync(filePathIdl)) {
      console.error(`File not found: ${filePathIdl}`);
      process.exit(1);
    }
    const idl = JSON.parse(fs.readFileSync(filePathIdl, 'utf-8'));

    const program = new Program(idl, provider);

    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
    console.log('GEn Metadata');
    const [metadataAccountPda, _metadataBump] = await PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      TOKEN_METADATA_PROGRAM_ID,
    );
    const tokenUri = await getUrlMetadataForProject(tokenName, imageUri);
    try {
      const tx = await program.methods
        .createToken(tokenName, tokenSymbol, tokenUri)
        .accounts({
          payer: payerKeypair.publicKey,
          mintAccount: mint,
          metadataAccount: metadataAccountPda,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([mintKeypair])
        .rpc();
      console.log('Your transaction signature', tx);

      return mint.toBase58();
    } catch (error) {
      console.error('Error creating token: ', error);
      return null;
    }
  }

  per(num: number, amount: number): number {
    return (num * amount) / 100;
  }
  //TODO: change name?
  async countAmountForMInt(
    projectLaunchInvestments: ProjectLaunchInvestment[],
    totalAmount: number,
    projectName: string,
    milestoneId: string,
  ) {
    try {
      for (const investment of projectLaunchInvestments) {
        let investAmount = investment.amount;
        let investWallet = investment.investor.walletId;
        let nftMetadata;
        let twentyFifth = this.per(totalAmount, 25);
        let fifty = this.per(totalAmount, 50);
        let seventyFive = this.per(totalAmount, 75);
        let tierLabel: string;
        let imageUrl: string;
        if (investAmount <= twentyFifth) {
          tierLabel = 'Bronze';
          imageUrl =
            'https://gateway.pinata.cloud/ipfs/bafybeicfevpkhv33ktpaohbdvyojwmo2byh645iyynojat5bdstgyrmpoq';
        } else if (investAmount > twentyFifth && investAmount <= fifty) {
          tierLabel = 'Silver';
          imageUrl =
            'https://gateway.pinata.cloud/ipfs/bafybeid3d723sk4opwzazmrtmrf72k2624hcsmguyqei3fgngy4upenq64';
        } else if (investAmount > fifty && investAmount <= seventyFive) {
          tierLabel = 'Gold';
          imageUrl =
            'https://gateway.pinata.cloud/ipfs/bafybeigmk4gwfdo4kororexh4t7fvo2zmj26etirnvmiiobbnd5xwzliv4';
        } else {
          tierLabel = 'Platinum';
          imageUrl =
            'https://gateway.pinata.cloud/ipfs/bafybeihlj46b4kv5ar6erzj6537wnaw5q2rp4p2qm45tcsds3x25btfcda';
        }
        const metadatUri = await getUrlMetadata(
          projectName,
          milestoneId,
          investment.amount,
          imageUrl,
        );

        nftMetadata = {
          name: `${projectName} - ${tierLabel} NFT`,
          symbol: 'INVESTNFT',
          uri: metadatUri,
          id: new BN(Math.floor(Math.random() * 1000000)),
        };
        const price = 1000000; // 1 SOL
        const cant = new BN(1); // 1 NFT

        this.mintAndTransferNftFunction(nftMetadata, investWallet, price, cant);
      }
    } catch (error) {
      console.error('Error during proccess investment.', error);
    }
  }

  async mintAndTransferNftFunction(
    metadata: NftMetadataInterface,
    recipient: string,
    price: number,
    cant: BN,
  ) {
    const filePathBaKey = path.resolve(__dirname, 'ba_private_key.json'); // TODO: add here import from env

    if (!fs.existsSync(filePathBaKey)) {
      console.error(`File not found: ${filePathBaKey}`);
      process.exit(1);
    }
    const BA_PRIVATE_KEY = process.env.BA_PRIVATE_KEY;
    if (!BA_PRIVATE_KEY) {
      console.log("BA_PRIVATE_KEY wasn't find");
      process.exit(0);
    }
    const secretKeyArray = BA_PRIVATE_KEY.split(',').map(n => Number(n.trim()));
    const payerKeypair = Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));
    const payerWallet = new Wallet(payerKeypair);

    const recipientPublicKey = new PublicKey(recipient);

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed' as Commitment);

    const provider = new AnchorProvider(
      connection,
      payerWallet,
      { commitment: 'confirmed' }, // anchor.AnchorProvider.defaultOptions()
    );

    const filePathIdl = path.resolve(__dirname, 'idl.json');
    if (!fs.existsSync(filePathIdl)) {
      console.error(`Файл не знайдено: ${filePathIdl}`);
      process.exit(1);
    }
    const idl = JSON.parse(fs.readFileSync(filePathIdl, 'utf-8'));
    const program = new Program(idl, provider);

    const [mintPda, mintBump] = await PublicKey.findProgramAddressSync(
      [Buffer.from('mint'), Buffer.from(metadata.id.toArrayLike(Buffer, 'le', 8))],
      PROGRAM_ID,
    );
    console.log('mint', mintPda.toString());

    try {
      const signature = await program.methods
        .mint(metadata.id, metadata.name, metadata.symbol, metadata.uri)
        .accounts({
          mintAuthority: payerKeypair.publicKey,
          payer: payerKeypair.publicKey,
          recipient: recipientPublicKey,
          mint: mintPda,
        })
        .signers([payerKeypair])
        .rpc();

      console.log('Transaction Signature:', signature);
    } catch (error) {
      console.error('\nTransaction failed!');
      console.error(error);
      if (error instanceof AnchorError) {
        console.error('Anchor Error:', error.error);
        console.error('Error Logs:', error.logs);
      } else if (error instanceof Error) {
        console.error('Standard Error:', error.message);
      }
      throw error;
    }
  }
}

const getUrlMetadata = async (
  projectName: string,
  milestoneId: string,
  amount: number,
  imageUrl: string,
) => {
  const attributes = [
    {
      trait_type: 'Project Name',
      value: projectName,
    },
    {
      trait_type: 'Milestone Id',
      value: milestoneId,
    },
    {
      trait_type: 'Investment amount',
      value: amount,
    },
  ];
  const metadata = {
    name: `${projectName} - milesone id - ${milestoneId}`,
    symbol: 'FINMILEST',
    description: `Milestone NFT for completing ${milestoneId} of project ${projectName}.`,
    attributes: attributes,
    image: imageUrl,
    properties: {
      files: [
        {
          type: 'image/png',
          uri: imageUrl,
        },
      ],
    },
  };
  const storage = new ThirdwebStorage({
    secretKey: process.env.THIRDWEB_STORAGE_SECRET,
  });
  const fileBuffer = Buffer.from(JSON.stringify(metadata, null, 2));
  const uri = await storage.upload(fileBuffer);
  return storage.resolveScheme(uri);
};
const getUrlMetadataForProject = async (projectName: string, imageUrl: string) => {
  const attributes = [
    {
      trait_type: 'Project Name',
      value: projectName,
    },
    // vожна додати опис проєкту наприклад або загальну кількість інвестицій
  ];
  const metadata = {
    name: `${projectName}`,
    symbol: 'PROTOKEN',
    description: `Project tokens, that were made after project - ${projectName} submition.`,
    attributes: attributes,
    image: imageUrl,
    properties: {
      files: [
        {
          type: 'image/png',
          uri: imageUrl,
        },
      ],
    },
  };
  const storage = new ThirdwebStorage({
    secretKey: process.env.THIRDWEB_STORAGE_SECRET,
  });
  const fileBuffer = Buffer.from(JSON.stringify(metadata, null, 2));
  const uri = await storage.upload(fileBuffer);
  return storage.resolveScheme(uri);
};
const findAllNftForInvestor = async (pubKey: string, projectName: string) => {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed' as Commitment);
  const metaplex: ReturnType<typeof Metaplex.make> = Metaplex.make(connection);

  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(new PublicKey(pubKey), {
    programId: TOKEN_PROGRAM_ID,
  });

  const potentialNftMints: PublicKey[] = [];
  for (const { account } of tokenAccounts.value) {
    const info = account.data.parsed.info;
    if (info.tokenAmount.uiAmount === 1 && info.tokenAmount.decimals === 0) {
      potentialNftMints.push(new PublicKey(info.mint));
    }
  }
  if (potentialNftMints.length === 0) {
    return {
      nftMintAddresses: [],
      totalInvestmentAmount: new BN(0),
    };
  }
  const filteredNfts = [];
  let investAmount = new BN(0);
  for (const mint of potentialNftMints) {
    try {
      const nft = await metaplex.nfts().findByMint({ mintAddress: mint });

      if (!nft || !nft.uri) {
        continue;
      }
      let offChainMetadata: OffChainMetadata | null = null;
      try {
        const jsonResponse = await metaplex.storage().download(nft.uri);

        if (jsonResponse.buffer) {
          try {
            offChainMetadata = JSON.parse(
              jsonResponse.buffer.toString('utf-8'),
            ) as OffChainMetadata;
          } catch (parseError) {
            console.warn(`Could not parse JSON from buffer for ${nft.uri}`, parseError);
            continue;
          }
        } else {
          console.warn(`Could not download or parse metadata content for ${nft.uri}`);
          continue;
        }

        if (
          !offChainMetadata ||
          !offChainMetadata.attributes ||
          !Array.isArray(offChainMetadata.attributes)
        ) {
          continue;
        }
      } catch (fetchError) {
        console.warn(
          `Error fetching/parsing metadata from ${nft.uri} for mint ${mint.toBase58()}:`,
          fetchError,
        );
        continue;
      }

      const projectAttribute = offChainMetadata.attributes.find(
        attr => attr.trait_type === 'Project Name',
      );
      if (projectAttribute && projectAttribute.value === projectName) {
        filteredNfts.push(nft.address);
        // тут треба поправити
        const investmentAttribute = offChainMetadata.attributes.find(
          attr => attr.trait_type === 'Investment amount',
        );
        if (investmentAttribute) {
          const bnAmount = new BN(investmentAttribute.value);
          investAmount = bnAmount;
          console.log(investAmount);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }
  for (const nft of filteredNfts) {
    console.log(nft);
  }
  return {
    nftMintAddresses: filteredNfts,
    totalInvestmentAmount: investAmount,
  };
};
const burnNFTs = async (nftCollection: web3.PublicKey[], investorAddress: string) => {
  const BA_PRIVATE_KEY = process.env.BA_PRIVATE_KEY;
  if (!BA_PRIVATE_KEY) {
    console.error("BA_PRIVATE_KEY wasn't find.");
    process.exit(0);
  }

  const secretKeyArray = BA_PRIVATE_KEY.split(',').map(n => Number(n.trim()));
  const mintAuthorityKeypair = Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));
  const mintAuthorityWallet = new Wallet(mintAuthorityKeypair);

  const connection = new Connection('https://api.devnet.solana.com', 'confirmed' as Commitment);

  const provider = new AnchorProvider(connection, mintAuthorityWallet, {
    commitment: 'confirmed',
  });

  const filePathIdl = path.resolve(__dirname, 'idlToken.json');
  if (!fs.existsSync(filePathIdl)) {
    console.error(`File wasn't find: ${filePathIdl}`);
    process.exit(1);
  }
  const idl = JSON.parse(fs.readFileSync(filePathIdl, 'utf-8'));

  const program = new Program(idl, provider);

  const investorPubKey = new PublicKey(investorAddress);
  //   const transaction = new Transaction();
  const instructions: web3.TransactionInstruction[] = [];
  for (const nftAddress of nftCollection) {
    try {
      const instruction = await program.methods
        .burnNft()
        .accounts({
          investor: investorPubKey,
          nftMint: nftAddress,
        })
        .instruction();
      instructions.push(instruction);
    } catch (err) {
      console.error(err);
    }
  }
  return instructions;
};
const startVestingTokens = async (
  tokenAddress: string,
  investorAddress: string,
  totalAmount: BN,
) => {
  const BA_PRIVATE_KEY = process.env.BA_PRIVATE_KEY;
  if (!BA_PRIVATE_KEY) {
    console.log("BA_PRIVATE_KEY wasn't find");
    console.error('BA_PRIVATE_KEY environment variable is not set!');
    throw new Error('Server configuration error: BA_PRIVATE_KEY is missing.');
  } else {
    console.log('BA_PRIVATE_KEY was found');
  }
  const secretKeyArray = BA_PRIVATE_KEY.split(',').map(n => Number(n.trim()));
  const mintAuthorityKeypair = Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));
  const mintAuthorityWallet = new Wallet(mintAuthorityKeypair);

  const connection = new Connection('https://api.devnet.solana.com', 'confirmed' as Commitment);

  const provider = new AnchorProvider(connection, mintAuthorityWallet, {
    commitment: 'confirmed',
  });

  const filePathIdl = path.resolve(__dirname, 'idlToken.json');
  if (!fs.existsSync(filePathIdl)) {
    console.error(`File wasn't find: ${filePathIdl}`);
    process.exit(1);
  }
  const idl = JSON.parse(fs.readFileSync(filePathIdl, 'utf-8'));

  const program = new Program(idl, provider);

  const vesting_duration = new BN(30 * 60); // 1 hour
  const tge_percentage = 1000; // 10% of total amount (1000 bps)

  const investorPubKey = new PublicKey(investorAddress);
  const tokenPubKey = new PublicKey(tokenAddress);

  const [vestingAccountPda, vestingAccountBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('vesting'), investorPubKey.toBuffer(), tokenPubKey.toBuffer()],
    program.programId,
  );

  const [vaultAuthorityPda, vaultAuthorityBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault_authority'), investorPubKey.toBuffer(), tokenPubKey.toBuffer()],
    program.programId,
  );

  const [vestingVaultPda, vestingVaultBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), investorPubKey.toBuffer(), tokenPubKey.toBuffer()],
    program.programId,
  );

  const associatedTokenAccountAddress = getAssociatedTokenAddressSync(tokenPubKey, investorPubKey);
  try {
    const instruction = await program.methods
      .investorVestingTokens(totalAmount, vesting_duration, tge_percentage)
      .accountsStrict({
        mintAuthority: mintAuthorityWallet.publicKey,
        fungibleMint: tokenPubKey,
        investor: investorPubKey,
        associatedTokenAccount: associatedTokenAccountAddress,
        vestingAccount: vestingAccountPda,
        vaultAuthority: vaultAuthorityPda,
        vestingVault: vestingVaultPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
      })
      .instruction();

    return instruction;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export default new NftMintService();
