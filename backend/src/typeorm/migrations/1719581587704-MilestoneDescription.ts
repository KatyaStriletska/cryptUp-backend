import { MigrationInterface, QueryRunner } from "typeorm";

export class MilestoneDescription1719581587704 implements MigrationInterface {
    name = 'MilestoneDescription1719581587704'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "milestone" ALTER COLUMN "description" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "milestone" ALTER COLUMN "description" DROP NOT NULL`);
    }

}
