import { MigrationInterface, QueryRunner } from "typeorm";

export class Proposal1721715676024 implements MigrationInterface {
    name = 'Proposal1721715676024'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."proposal_vote_decision_enum" RENAME TO "proposal_vote_decision_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."proposal_vote_decision_enum" AS ENUM('Approve', 'Cancel', 'Abstain')`);
        await queryRunner.query(`ALTER TABLE "proposal_vote" ALTER COLUMN "decision" TYPE "public"."proposal_vote_decision_enum" USING "decision"::"text"::"public"."proposal_vote_decision_enum"`);
        await queryRunner.query(`DROP TYPE "public"."proposal_vote_decision_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."proposal_vote_decision_enum_old" AS ENUM('for', 'against', 'abstained')`);
        await queryRunner.query(`ALTER TABLE "proposal_vote" ALTER COLUMN "decision" TYPE "public"."proposal_vote_decision_enum_old" USING "decision"::"text"::"public"."proposal_vote_decision_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."proposal_vote_decision_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."proposal_vote_decision_enum_old" RENAME TO "proposal_vote_decision_enum"`);
    }

}
