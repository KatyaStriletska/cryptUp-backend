import amqp, { Channel } from 'amqplib';
import { RabbitMQException } from './exceptions/exceptions.utils';
import { CommandType } from './dao.utils';
import daoService from '../modules/dao/dao.service';
import projectLaunchService from '../modules/project-launch/project-launch.service';
import proposalService from '../modules/proposal/proposal.service';
import { ProposalStatusEnum } from '../types/enums/proposal-status.enum';

export enum RabbitMQExchangeNames {
  Fanout = 'fanout',
  Direct = 'direct',
  Topic = 'topic',
  Headers = 'headers',
}

export class RabbitMQ {
  private requestChannel: Channel;
  private responseChannel: Channel;
  private ready: boolean = false;

  constructor() {}

  public async connect() {
    if (this.isConnected()) return;
    const rabbitmqUrl = process.env.RABBITMQ_URL;

    if (!process.env.RABBITMQ_URI) {
      throw new RabbitMQException('Cannot connect to the RabbitMQ due to invalid RabbitMQ url');
    }
    if (!rabbitmqUrl) {
      throw new Error('RABBITMQ_URL is not set in environment variables');
    }
    try {
      console.log("Connecting to RabbitMQ at:", rabbitmqUrl);
      const requestConnection = await amqp.connect(rabbitmqUrl);
      const responseConnection = await amqp.connect(rabbitmqUrl);

      this.requestChannel = await requestConnection.createChannel();
      this.responseChannel = await responseConnection.createChannel();

      this.ready = true;
      console.log("Connected to RabbitMQ");
    } catch (error) {
      console.error("RabbitMQ connection error:", error);
    }
  }
  //   const requestConnection = await amqp.connect(process.env.RABBITMQ_URI);
  //   const responseConnection = await amqp.connect(process.env.RABBITMQ_URI);

  //   this.requestChannel = await requestConnection.createChannel();
  //   this.responseChannel = await responseConnection.createChannel();

  //   this.ready = true;
  // }

  public async publish(routingKey: string, message: unknown, commandType: string) {
    console.log("PUBLISH!");
    console.log("Publishing message to RabbitMQ", {
      routingKey,
      message,
      commandType,
    });
    
    if (!this.requestChannel) {
      throw new RabbitMQException('Cannot publish the message due to the channel is not connected');
    }
    if (!process.env.RABBITMQ_EXCHANGE_NAME) {
      throw new RabbitMQException(
        'Cannot publish the message due to the exchange name was not provided',
      );
    }

    await this.requestChannel.assertExchange(
      process.env.RABBITMQ_EXCHANGE_NAME,
      RabbitMQExchangeNames.Direct,
    );
    console.log(process.env.RABBITMQ_EXCHANGE_NAME)
    await this.requestChannel.assertQueue('request_queue', { durable: true });
    await this.requestChannel.bindQueue('request_queue', 'dao_exchange', routingKey);
    await this.requestChannel.assertExchange('dao_exchange', 'direct', { durable: true });
    if (!this.requestChannel) {
      throw new Error("requestChannel is not initialized!");
    }
    console.log(this.requestChannel);
    console.log("Publishing message to RabbitMQ", {
      routingKey,
      message,
      commandType,
    });
    if (!this.requestChannel) {
      throw new Error("requestChannel is not initialized!");
    }
    
    await this.requestChannel.publish(
      process.env.RABBITMQ_EXCHANGE_NAME,
      'broker.request',
      Buffer.from(JSON.stringify(message)),
      { persistent: true, headers: { command: commandType } },
    );
  }

  public async receive(
    queueName: string,
    bindingKey: string,
    callback?: (message: any, error?: any) => any,
  ) {
    if (!this.responseChannel) {
      throw new RabbitMQException('Cannot receive the message due to the channel is not connected');
    }

    if (!process.env.RABBITMQ_EXCHANGE_NAME) {
      throw new RabbitMQException(
        'Cannot receive the message due to the exchange name was not provided',
      );
    }

    await this.responseChannel.assertExchange(
      process.env.RABBITMQ_EXCHANGE_NAME,
      RabbitMQExchangeNames.Direct,
    );

    const queue = await this.responseChannel.assertQueue(queueName, { durable: true });

    await this.responseChannel.bindQueue(
      queue.queue,
      process.env.RABBITMQ_EXCHANGE_NAME,
      bindingKey,
    );

    this.responseChannel.consume(queue.queue, message => {
      if (message) {
        const data = JSON.parse(message.content.toString());
        this.responseChannel.ack(message);
        callback?.(data);
      } else {
        callback?.(null, 'The message is empty');
      }
    });
    
  }

  public isConnected() {
    return this.ready;
  }
}

export class RabbitMQConsumer {
  constructor(private readonly rabbitMQInstance: RabbitMQ = new RabbitMQ()) {}

  public async consume() {
    await this.rabbitMQInstance.connect();

    this.rabbitMQInstance.receive('response_queue', 'broker.response', async (message, error) => {
      console.log(message);
      if (message.command_type) {
        switch (message.command_type) {
          case CommandType.CreateDao:
            this.executeCreateDaoCommand(message);
            break;
          case CommandType.Withdraw:
            this.executeWithdrawCommand(message);
          case CommandType.AddMember:
          case CommandType.RemoveMember:
          case CommandType.Vote:
            if (message) console.log(message);
            if (error) console.log(error);
            break;
        }
      }
    });
  }

  async executeCreateDaoCommand(message: any) {
    const { project_id, multisig_pda, vault_pda } = message;
    const projectLaunch = await projectLaunchService.findOne({
      where: { id: project_id },
      relations: { approver: true },
    });

    console.log(projectLaunch);

    if (projectLaunch.approver.id) {
      const dao = await daoService.create({
        projectLaunch: { id: project_id },
        multisigPda: multisig_pda,
        vaultPda: vault_pda,
      });

      daoService.update(dao.id, { membersToAdd: [projectLaunch.approver] });
    }
  }

  async executeWithdrawCommand(message: any) {
    const { proposal_id, is_execute, error_msg } = message;

    if (proposal_id) {
      if (error_msg) {
        await proposalService.update(proposal_id, {
          status: ProposalStatusEnum.Failed,
        });
      } else {
        if (is_execute === 'true') {
          await proposalService.update(proposal_id, {
            status: ProposalStatusEnum.Executed,
            executedAt: new Date(),
          });
        } else {
          await proposalService.update(proposal_id, {
            status: ProposalStatusEnum.Voting,
          });
        }
      }
    }
  }
}

export const rabbitMQ = new RabbitMQ();
export const rabbitMQConsumer = new RabbitMQConsumer();
