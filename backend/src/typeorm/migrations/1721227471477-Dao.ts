import { MigrationInterface, QueryRunner } from "typeorm";

export class Dao1721227471477 implements MigrationInterface {
    name = 'Dao1721227471477'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dao" ADD "projectLaunchId" uuid`);
        await queryRunner.query(`ALTER TABLE "dao" ADD CONSTRAINT "UQ_5aa10eeeac7b7dd16fb6e02d3eb" UNIQUE ("projectLaunchId")`);
        await queryRunner.query(`ALTER TABLE "dao" ADD CONSTRAINT "FK_5aa10eeeac7b7dd16fb6e02d3eb" FOREIGN KEY ("projectLaunchId") REFERENCES "project_launch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dao" DROP CONSTRAINT "FK_5aa10eeeac7b7dd16fb6e02d3eb"`);
        await queryRunner.query(`ALTER TABLE "dao" DROP CONSTRAINT "UQ_5aa10eeeac7b7dd16fb6e02d3eb"`);
        await queryRunner.query(`ALTER TABLE "dao" DROP COLUMN "projectLaunchId"`);
    }

}
