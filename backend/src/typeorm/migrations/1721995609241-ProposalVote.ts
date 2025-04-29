import { MigrationInterface, QueryRunner } from "typeorm";

export class ProposalVote1721995609241 implements MigrationInterface {
    name = 'ProposalVote1721995609241'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."proposal_status_enum" RENAME TO "proposal_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."proposal_status_enum" AS ENUM('pending', 'failed', 'voting', 'pending_execution', 'executing', 'executed')`);
        await queryRunner.query(`ALTER TABLE "proposal" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "proposal" ALTER COLUMN "status" TYPE "public"."proposal_status_enum" USING "status"::"text"::"public"."proposal_status_enum"`);
        await queryRunner.query(`ALTER TABLE "proposal" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."proposal_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."proposal_status_enum_old" AS ENUM('pending', 'failed', 'voting', 'executed')`);
        await queryRunner.query(`ALTER TABLE "proposal" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "proposal" ALTER COLUMN "status" TYPE "public"."proposal_status_enum_old" USING "status"::"text"::"public"."proposal_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "proposal" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."proposal_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."proposal_status_enum_old" RENAME TO "proposal_status_enum"`);
    }

}
