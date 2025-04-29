import { Request, Response } from 'express';
import { Controller } from '../../decorators/app.decorators';
import { HttpStatusCode } from 'axios';
import { ServerException } from '../../utils/exceptions/exceptions.utils';

@Controller()
export class FileController {
  async getFile(request: Request, response: Response) {
    const ipfsResponse = await fetch(`https://ipfs.io/ipfs/${request.query.file}`, {
      cache: 'force-cache',
    });

    if (ipfsResponse.status !== HttpStatusCode.Ok) {
      throw new ServerException('Cannot fetch the file from IPFS');
    }

    const contentType = ipfsResponse.headers.get('content-type');
    const contentLength = ipfsResponse.headers.get('content-length');

    if (!contentType || !contentLength) {
      throw new ServerException('Cannot fetch the file from IPFS');
    }

    response.setHeader('Content-Type', contentType);
    response.setHeader('Content-Length', contentLength);

    const data = await ipfsResponse.arrayBuffer();
    const buffer = Buffer.from(data);

    return response.status(HttpStatusCode.Ok).send(buffer);
  }
}

export default new FileController();
