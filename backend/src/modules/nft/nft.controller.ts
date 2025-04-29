import { Request, Response } from 'express';
import nftService from './nft.service';
import { HttpStatusCode } from 'axios';
import { Controller } from '../../decorators/app.decorators';
import _ from 'lodash';
interface FindNftsParams {
  investorAddress: string;
  projectName: string;
}
// @Controller()
// export class NftController {
/*
  async findMany(request: Request, response: Response) {
    const { investorAddress, projectName  } = request.params  as any;
    console.log("investorAddress ", investorAddress)
    console.log("projectName ", projectName)

    try {
      //  const matchingNfts = await nftService.findAllNftForInvestor(investorAddress, projectName);

      if (matchingNfts && matchingNfts.length > 0) {
          
          return response.status(HttpStatusCode.Ok).json({ nfts: matchingNfts });
      } else {
          return response.status(HttpStatusCode.NotFound).json({ message: "No matching NFTs found for this investor and project." });
      }
  } catch (error) {
      console.error("Error fetching NFTs in findMany controller:", error);
      return response.status(HttpStatusCode.InternalServerError).json({ message: "An error occurred while fetching NFTs." });
  }
  }
}*/
// export default new NftController();
