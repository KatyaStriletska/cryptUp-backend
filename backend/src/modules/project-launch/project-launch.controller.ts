import { Request, Response } from 'express';
import projectLaunchService from './project-launch.service';
import { HttpStatusCode } from 'axios';
import pinata from '../../utils/file.utils';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { Controller } from '../../decorators/app.decorators';
import qs from 'qs';
import { parseObjectStringValuesToPrimitives } from '../../utils/object.utils';
import _ from 'lodash';
import { IsNull, Not } from 'typeorm';
import { Readable } from 'stream';

@Controller()
export class ProjectLaunchController {
  async findMany(request: Request, response: Response) {
    const query = request.query
      ? parseObjectStringValuesToPrimitives(
          qs.parse(request.query as Record<string, any>, { comma: true, allowDots: true }),
        )
      : undefined;

    if (typeof query?.where?.approver?.id === 'object') {
      if (query?.where?.approver?.id?.not !== undefined) {
        query.where.approver.id = Not(
          query.where.approver.id.not === 0 ? IsNull() : query.where.approver.id.not,
        );
      }
    } else if (query?.where?.approver?.id === null) {
      query.where.approver.id = IsNull();
    }

    const projectLaunches = await projectLaunchService.findMany(
      _.merge({
        order: {
          createdAt: 'DESC',
        },
        ...query,
      }),
    );

    return response.status(HttpStatusCode.Ok).json(projectLaunches);
  }

  async findOne(request: Request, response: Response) {
    const query = request.query
      ? parseObjectStringValuesToPrimitives(
          qs.parse(request.query as Record<string, any>, { comma: true, allowDots: true }),
        )
      : undefined;
    const { id } = request.params;
    const projectLaunch = await projectLaunchService.findOne(_.merge(query, { where: { id } }));

    return response.status(HttpStatusCode.Ok).json(projectLaunch);
  }

  async create(request: Request, response: Response) {
    let team = JSON.parse(request.body.team);
    let files: Express.Multer.File[] = [];

    if (request.files) {
      if (Array.isArray(request.files)) {
        files.push(...request.files);
      } else {
        Object.values(request.files).forEach(value => files.push(...value));
      }
    }

    const createdProjectLaunch = await projectLaunchService.create(request.body);

    const logoFile = files.find(file => file.fieldname === 'project-logo') || null;
    const logo = logoFile
      ? (
          await pinata.pinFileToIPFS(Readable.from(logoFile.buffer), {
            pinataMetadata: { name: logoFile.originalname },
          })
        ).IpfsHash
      : null;

    const teamFiles = await Promise.all(
      files
        .filter(file => file.fieldname === 'team-images')
        .map(async file => ({
          name: file.originalname,
          hash: (
            await pinata.pinFileToIPFS(Readable.from(file.buffer), {
              pinataMetadata: { name: file.originalname },
            })
          ).IpfsHash,
        })),
    );

    team = team.map((member: any) => ({
      ...member,
      image: teamFiles?.find(file => file.name === member.image)?.hash || null,
    }));

    const projectDocuments = await Promise.all(
      files
        .filter(file => file.fieldname === 'project-documents')
        .map(
          async file =>
            (
              await pinata.pinFileToIPFS(Readable.from(file.buffer), {
                pinataMetadata: { name: file.originalname },
              })
            ).IpfsHash,
        ),
    );

    const projectLaunch = await projectLaunchService.update(createdProjectLaunch.id, {
      team,
      projectDocuments,
      logo: logo || null,
    });

    return response.status(HttpStatusCode.Created).json(projectLaunch);
  }

  async update(request: Request, response: Response) {
    console.log("UPD PROJECT")
    const { id } = request.params;
    const projectLaunchToUpdate = await projectLaunchService.findOne({ where: { id } });

    let team = request.body.team ? JSON.parse(request.body.team) : undefined;
    let files: Express.Multer.File[] = [];

    if (request.files) {
      if (Array.isArray(request.files)) {
        files.push(...request.files);
      } else {
        Object.values(request.files).forEach(value => files.push(...value));
      }
    }

    const logoFile = files.find(file => file.fieldname === 'project-logo');

    if (logoFile !== undefined && projectLaunchToUpdate.logo) {
      pinata.unpin(projectLaunchToUpdate.logo).catch(console.log);
    }

    const logo = logoFile
      ? (
          await pinata.pinFileToIPFS(Readable.from(logoFile.buffer), {
            pinataMetadata: { name: logoFile.originalname },
          })
        ).IpfsHash
      : null;

    const teamFiles = await Promise.all(
      files
        .filter(file => file.fieldname === 'team-images')
        .map(async file => ({
          name: file.originalname,
          hash: (
            await pinata.pinFileToIPFS(Readable.from(file.buffer), {
              pinataMetadata: { name: file.originalname },
            })
          ).IpfsHash,
        })),
    );

    if (projectLaunchToUpdate.team) {
      const projectLaunchToUpdateTeam = projectLaunchToUpdate.team;

      projectLaunchToUpdateTeam.forEach((member: any) => {
        if (member.image && teamFiles?.find(file => file.name === member.image) !== undefined) {
          pinata.unpin(member.image).catch(console.log);
        }
      });
    }

    if (team) {
      team = team.map((member: any) => ({
        ...member,
        image: teamFiles?.find(file => file.name === member.image)?.hash || null,
      }));
    }

    const projectDocuments = await Promise.all(
      files
        .filter(file => file.fieldname === 'project-documents')
        .map(
          async file =>
            (
              await pinata.pinFileToIPFS(Readable.from(file.buffer), {
                pinataMetadata: { name: file.originalname },
              })
            ).IpfsHash,
        ),
    );

    delete request.body['team-images'];
    delete request.body['project-documents'];
    delete request.body['project-logo'];

    if (request.body.approverId === '' || request.body.approverId === null) {
      delete request.body['approverId'];
      request.body.approver = { id: null };
    }

    if (request.body.businessAnalystReview === '') {
      request.body.businessAnalystReview = null;
    }

    let data = { ...request.body };

    if (team) data = { ...data, team };
    if (files.length > 0) {
      data = {
        ...data,
        projectDocuments,
        logo: logo || null,
      };
    }

    const projectLaunch = await projectLaunchService.update(id, data);

    return response.status(HttpStatusCode.Ok).json(projectLaunch);
  }

  async remove(request: Request, response: Response) {
    const { id } = request.params;
    await projectLaunchService.findOne({ where: { id } });
    const projectLaunch = await projectLaunchService.remove(id);

    if (projectLaunch.logo) {
      pinata.unpin(projectLaunch.logo).catch(console.log);
    }

    if (projectLaunch.projectDocuments) {
      projectLaunch.projectDocuments.forEach((document: any) => {
        if (document) {
          pinata.unpin(document).catch(console.log);
        }
      });
    }

    if (projectLaunch.team && typeof projectLaunch.team !== 'string') {
      projectLaunch.team.forEach((member: any) => {
        if (member.image) {
          pinata.unpin(member.image).catch(console.log);
        }
      });
    }

    return response.status(HttpStatusCode.Ok).json(projectLaunch);
  }

  async createInvestor(request: Request, response: Response) {
    const { id } = request.params;
    const projectLaunchInvestment = await projectLaunchService.createInvestment(id, request.body);

    return response.status(HttpStatusCode.Created).json(projectLaunchInvestment);
  }

  async updateInvestor(request: Request, response: Response) {
    const { id, investorId } = request.params;
    const projectLaunchInvestment = await projectLaunchService.updateInvestment(
      id,
      investorId,
      request.body,
    );

    return response.status(HttpStatusCode.Created).json(projectLaunchInvestment);
  }
}

export default new ProjectLaunchController();
