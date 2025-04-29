import { Request, Response } from 'express';
import projectService from './project.service';
import { HttpStatusCode } from 'axios';
import { Controller } from '../../decorators/app.decorators';
import { parseObjectStringValuesToPrimitives } from '../../utils/object.utils';
import qs from 'qs';
import _ from 'lodash';
import nftService from '../nft/nft.service';

@Controller()
export class ProjectController {
  async findMany(request: Request, response: Response) {
    const query = request.query
      ? parseObjectStringValuesToPrimitives(
          qs.parse(request.query as Record<string, any>, { comma: true, allowDots: true }),
        )
      : undefined;

    const projects = await projectService.findMany({
      order: {
        createdAt: 'DESC',
        milestones: {
          createdAt: 'DESC',
        },
      },
      ...query,
    });

    return response.status(HttpStatusCode.Ok).json(projects);
  }

  async findOne(request: Request, response: Response) {
    const query = request.query
      ? parseObjectStringValuesToPrimitives(
          qs.parse(request.query as Record<string, any>, { comma: true, allowDots: true }),
        )
      : undefined;

    const { id } = request.params as any;
    const project = await projectService.findOne({
      order: {
        milestones: {
          createdAt: 'DESC',
        },
      },
      ..._.merge(query, { where: { id } }),
    });
    return response.status(HttpStatusCode.Ok).json(project);
  }

  async create(request: Request, response: Response) {
    const project = await projectService.create(request.body);

    return response.status(HttpStatusCode.Created).json(project);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params as any;
    await projectService.findOne({ where: { id } });
    const project = await projectService.update(id, request.body);

    if (project.isFinal && !project.tokenMintAddress) {
      const tokenMintAddress = await nftService.createProjectToken(
        project.projectLaunchName,
        'PROTOKEN', // тут треба фотку брати з проєкту
        'https://gateway.pinata.cloud/ipfs/bafkreienmja33t43ly3rvs54jbxdqqvkqyse4ltbg2gsrwcjxhoboaosei',
      );
      if (tokenMintAddress) {
        await projectService.update(id, { tokenMintAddress });
        const updatedProject = await projectService.findOne({ where: { id } });
        return response.status(HttpStatusCode.Ok).json(updatedProject);
      }
    }
    return response.status(HttpStatusCode.Ok).json(project);
  }

  async remove(request: Request, response: Response) {
    const { id } = request.params as any;
    await projectService.findOne({ where: { id } });
    const project = await projectService.remove(id);

    return response.status(HttpStatusCode.Ok).json(project);
  }

  async prepareNftMetadata(request: Request, response: Response) {
    const ipfsURL = await projectService.prepareNftMetadata(request.body);

    return response.status(HttpStatusCode.Created).json({ ipfsURL });
  }

  async burnAndVesting(request: Request, response: Response) {
    const { projectId, investorAddress } = request.body;

    if (!investorAddress) {
      return response
        .status(HttpStatusCode.BadRequest)
        .json({ error: 'Investor address is required' });
    }

    if (!projectId) {
      return response.status(HttpStatusCode.BadRequest).json({ error: 'Project ID is required' });
    }
    try {
      const project = await projectService.findOne({ where: { id: projectId } });

      if (!project) {
        return response
          .status(HttpStatusCode.NotFound)
          .json({ error: `Project not found: ${projectId}` });
      }
      if (!project.tokenMintAddress) {
        return response
          .status(HttpStatusCode.BadRequest)
          .json({ error: "Project doesn't have token address" });
      }
      const serializedTransaction = await nftService.burnAndVesting(
        investorAddress,
        project.projectLaunchName,
        project.tokenMintAddress,
      );

      if (!serializedTransaction) {
        console.error('Failed to prepare transaction for project');
        return response.status(HttpStatusCode.InternalServerError).json({
          error: 'Failed to prepare transaction for project',
        });
      }
      return response.status(HttpStatusCode.Ok).json({ serializedTransaction });
    } catch (err: any) {
      return response.status(HttpStatusCode.InternalServerError).json({
        error: err.message,
      });
    }
  }
  async startTeamVesting(request: Request, response: Response) {
    const { projectId, beneficiaryAddress } = request.body;

    if (!beneficiaryAddress) {
      return response
        .status(HttpStatusCode.BadRequest)
        .json({ error: 'Investor address is required' });
    }

    if (!projectId) {
      return response.status(HttpStatusCode.BadRequest).json({ error: 'Project ID is required' });
    }
    try {
      const project = await projectService.findOne({ where: { id: projectId } });

      if (!project) {
        return response
          .status(HttpStatusCode.NotFound)
          .json({ error: `Project not found: ${projectId}` });
      }
      if (!project.tokenMintAddress) {
        return response
          .status(HttpStatusCode.BadRequest)
          .json({ error: "Project doesn't have token address" });
      }
      console.log(project.projectLaunchRaisedFunds);
      const serializedTransaction = await nftService.startTeamVesting(
        beneficiaryAddress,
        project.tokenMintAddress,
      );

      if (!serializedTransaction) {
        console.error('Failed to prepare transaction for project');
        return response.status(HttpStatusCode.InternalServerError).json({
          error: 'Failed to prepare transaction for project',
        });
      }
      return response.status(HttpStatusCode.Ok).json({ serializedTransaction });
    } catch (err: any) {
      return response.status(HttpStatusCode.InternalServerError).json({
        error: err.message,
      });
    }
  }
}

export default new ProjectController();
