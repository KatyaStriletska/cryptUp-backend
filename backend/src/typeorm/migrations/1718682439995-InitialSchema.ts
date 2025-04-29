import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1718682439995 implements MigrationInterface {
    name = 'InitialSchema1718682439995'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "milestone" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "mergedPullRequestUrl" character varying(511) NOT NULL, "transactionApprovalHash" character varying(511), "isFinal" boolean NOT NULL DEFAULT false, "isWithdrawn" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "projectId" uuid, CONSTRAINT "PK_f8372abce331f60ba7b33fe23a7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "data_account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accountHash" character varying(255) NOT NULL, "projectId" uuid, CONSTRAINT "REL_b02dee39e71c467bc31093b962" UNIQUE ("projectId"), CONSTRAINT "PK_8a8b19bba96952af65ff6f6f95d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "session" ("sessionId" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "userId" uuid, CONSTRAINT "REL_3d2f174ef04fb312fdebd0ddc5" UNIQUE ("userId"), CONSTRAINT "PK_6f8fc3d2111ccc30d98e173d8dd" PRIMARY KEY ("sessionId"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('Investor', 'BusinessAnalyst', 'Startup')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "walletId" character varying(64) NOT NULL, "username" character varying(30) NOT NULL, "email" character varying(50) NOT NULL, "role" "public"."user_role_enum" array NOT NULL DEFAULT '{Startup}', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "password" character varying, "avatar" text, "bio" text, "firstName" character varying(50), "lastName" character varying(50), "birthDate" TIMESTAMP WITH TIME ZONE, "nationality" character varying(50), "country" character varying(50), "state" character varying(50), "city" character varying(50), "street" character varying(100), "zipCode" character varying(10), "phone" character varying(20), CONSTRAINT "UQ_922e8c1d396025973ec81e2a402" UNIQUE ("walletId"), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "project_launch_investment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" bigint NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "investorId" uuid, "projectLaunchId" uuid, CONSTRAINT "PK_6d6826fae47755cab3631869f83" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "project_launch" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text NOT NULL, "logo" text, "isFundraised" boolean NOT NULL DEFAULT false, "fundraiseAmount" bigint NOT NULL, "fundraiseProgress" bigint NOT NULL DEFAULT '0', "fundraiseDeadline" TIMESTAMP WITH TIME ZONE NOT NULL, "projectDocuments" text array NOT NULL DEFAULT '{}', "team" jsonb NOT NULL DEFAULT '[]', "businessModel" text NOT NULL, "tokenomics" text NOT NULL, "roundDetails" jsonb NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "vaultTokenAccount" text NOT NULL, "cryptoTrackerAccount" text NOT NULL, "businessAnalystReview" text, "projectId" uuid, "authorId" uuid, "approverId" uuid, CONSTRAINT "REL_d59f3e0f9b526519ec1a4ae9ba" UNIQUE ("projectId"), CONSTRAINT "PK_ca07cc0566d257ce070c3269120" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5276043393af2e768a0b13dc92" ON "project_launch" ("name", "authorId") `);
        await queryRunner.query(`CREATE TABLE "project" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "projectLaunchName" character varying(255) NOT NULL, "isFinal" boolean NOT NULL DEFAULT false, "projectLaunchDescription" text NOT NULL, "projectLaunchRaisedFunds" bigint NOT NULL, "milestoneNumber" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "projectLaunchId" uuid, CONSTRAINT "REL_dadb21a1e290b8a0bbdbb9af92" UNIQUE ("projectLaunchId"), CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_2923918dbb5111b697c3233d20" ON "project" ("projectLaunchName", "projectLaunchId") `);
        await queryRunner.query(`CREATE TABLE "user_to_project" ("id" SERIAL NOT NULL, "projectId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_c07e85941c8d7cb44357ef35df4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "milestone" ADD CONSTRAINT "FK_edc28a2e0442554afe5eef2bdcb" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "data_account" ADD CONSTRAINT "FK_b02dee39e71c467bc31093b962a" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "project_launch_investment" ADD CONSTRAINT "FK_4dbb2c9d29bf1e9559fe7dab3c9" FOREIGN KEY ("investorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "project_launch_investment" ADD CONSTRAINT "FK_ed9f6d5e978b74e02ba3ed8ceb4" FOREIGN KEY ("projectLaunchId") REFERENCES "project_launch"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "project_launch" ADD CONSTRAINT "FK_d59f3e0f9b526519ec1a4ae9baf" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "project_launch" ADD CONSTRAINT "FK_d04b0861678527c05ab64d2405b" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "project_launch" ADD CONSTRAINT "FK_7b7d72c97670697df656e6f1ca3" FOREIGN KEY ("approverId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "FK_dadb21a1e290b8a0bbdbb9af925" FOREIGN KEY ("projectLaunchId") REFERENCES "project_launch"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_to_project" ADD CONSTRAINT "FK_24aab0c705d84cde7ada3c205b5" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_to_project" ADD CONSTRAINT "FK_b21627afd80f91f5610fa8cbfdd" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_to_project" DROP CONSTRAINT "FK_b21627afd80f91f5610fa8cbfdd"`);
        await queryRunner.query(`ALTER TABLE "user_to_project" DROP CONSTRAINT "FK_24aab0c705d84cde7ada3c205b5"`);
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "FK_dadb21a1e290b8a0bbdbb9af925"`);
        await queryRunner.query(`ALTER TABLE "project_launch" DROP CONSTRAINT "FK_7b7d72c97670697df656e6f1ca3"`);
        await queryRunner.query(`ALTER TABLE "project_launch" DROP CONSTRAINT "FK_d04b0861678527c05ab64d2405b"`);
        await queryRunner.query(`ALTER TABLE "project_launch" DROP CONSTRAINT "FK_d59f3e0f9b526519ec1a4ae9baf"`);
        await queryRunner.query(`ALTER TABLE "project_launch_investment" DROP CONSTRAINT "FK_ed9f6d5e978b74e02ba3ed8ceb4"`);
        await queryRunner.query(`ALTER TABLE "project_launch_investment" DROP CONSTRAINT "FK_4dbb2c9d29bf1e9559fe7dab3c9"`);
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`);
        await queryRunner.query(`ALTER TABLE "data_account" DROP CONSTRAINT "FK_b02dee39e71c467bc31093b962a"`);
        await queryRunner.query(`ALTER TABLE "milestone" DROP CONSTRAINT "FK_edc28a2e0442554afe5eef2bdcb"`);
        await queryRunner.query(`DROP TABLE "user_to_project"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2923918dbb5111b697c3233d20"`);
        await queryRunner.query(`DROP TABLE "project"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5276043393af2e768a0b13dc92"`);
        await queryRunner.query(`DROP TABLE "project_launch"`);
        await queryRunner.query(`DROP TABLE "project_launch_investment"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "session"`);
        await queryRunner.query(`DROP TABLE "data_account"`);
        await queryRunner.query(`DROP TABLE "milestone"`);
    }

}
