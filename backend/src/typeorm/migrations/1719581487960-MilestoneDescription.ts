import { MigrationInterface, QueryRunner } from "typeorm";

export class MilestoneDescription1719581487960 implements MigrationInterface {
    name = 'MilestoneDescription1719581487960'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "milestone" ADD "description" text DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "milestone" DROP COLUMN "description"`);
    }

}
