import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExternalIdToPL1746724993980 implements MigrationInterface {
    name = 'AddExternalIdToPL1746724993980'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project_launch" ADD "externalId" text NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project_launch" DROP COLUMN "externalId"`);
    }

}
