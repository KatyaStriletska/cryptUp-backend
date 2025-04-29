import { MigrationInterface, QueryRunner } from "typeorm";

export class Proposal1721739475748 implements MigrationInterface {
    name = 'Proposal1721739475748'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "proposal" DROP CONSTRAINT "FK_1a7351ceca05a1f279e581ea712"`);
        await queryRunner.query(`ALTER TABLE "proposal" DROP COLUMN "projectId"`);
        await queryRunner.query(`CREATE TYPE "public"."proposal_status_enum" AS ENUM('pending', 'failed', 'voting', 'executed')`);
        await queryRunner.query(`ALTER TABLE "proposal" ADD "status" "public"."proposal_status_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "proposal" ADD "milestoneId" uuid`);
        await queryRunner.query(`ALTER TABLE "proposal" ADD CONSTRAINT "FK_29f4d0d1ad219efb271456f4799" FOREIGN KEY ("milestoneId") REFERENCES "milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "proposal" DROP CONSTRAINT "FK_29f4d0d1ad219efb271456f4799"`);
        await queryRunner.query(`ALTER TABLE "proposal" DROP COLUMN "milestoneId"`);
        await queryRunner.query(`ALTER TABLE "proposal" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."proposal_status_enum"`);
        await queryRunner.query(`ALTER TABLE "proposal" ADD "projectId" uuid`);
        await queryRunner.query(`ALTER TABLE "proposal" ADD CONSTRAINT "FK_1a7351ceca05a1f279e581ea712" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
