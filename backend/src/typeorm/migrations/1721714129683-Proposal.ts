import { MigrationInterface, QueryRunner } from "typeorm";

export class Proposal1721714129683 implements MigrationInterface {
    name = 'Proposal1721714129683'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "proposal" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying(50) NOT NULL, "description" text NOT NULL, "proposalLink" character varying(256), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "executedAt" TIMESTAMP WITH TIME ZONE, "updatedAt" TIMESTAMP WITH TIME ZONE, "projectId" uuid, "authorId" uuid, CONSTRAINT "PK_ca872ecfe4fef5720d2d39e4275" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."proposal_vote_decision_enum" AS ENUM('for', 'against', 'abstained')`);
        await queryRunner.query(`CREATE TABLE "proposal_vote" ("memberId" uuid NOT NULL, "proposalId" uuid NOT NULL, "decision" "public"."proposal_vote_decision_enum" NOT NULL, "datetime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7a9400aac7c7c138c666c4696d5" PRIMARY KEY ("memberId", "proposalId"))`);
        await queryRunner.query(`ALTER TABLE "proposal" ADD CONSTRAINT "FK_1a7351ceca05a1f279e581ea712" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "proposal" ADD CONSTRAINT "FK_7fb3ca379aa24d018fa2f73ec6b" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "proposal_vote" ADD CONSTRAINT "FK_b3b4bebfd1d3d5a8a26da1db18a" FOREIGN KEY ("memberId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "proposal_vote" ADD CONSTRAINT "FK_ae3a9c536e7b25713eb875fcf43" FOREIGN KEY ("proposalId") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "proposal_vote" DROP CONSTRAINT "FK_ae3a9c536e7b25713eb875fcf43"`);
        await queryRunner.query(`ALTER TABLE "proposal_vote" DROP CONSTRAINT "FK_b3b4bebfd1d3d5a8a26da1db18a"`);
        await queryRunner.query(`ALTER TABLE "proposal" DROP CONSTRAINT "FK_7fb3ca379aa24d018fa2f73ec6b"`);
        await queryRunner.query(`ALTER TABLE "proposal" DROP CONSTRAINT "FK_1a7351ceca05a1f279e581ea712"`);
        await queryRunner.query(`DROP TABLE "proposal_vote"`);
        await queryRunner.query(`DROP TYPE "public"."proposal_vote_decision_enum"`);
        await queryRunner.query(`DROP TABLE "proposal"`);
    }

}
