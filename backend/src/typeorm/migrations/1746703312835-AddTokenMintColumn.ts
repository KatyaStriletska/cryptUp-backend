import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTokenMintColumn1746703312835 implements MigrationInterface {
    name = 'AddTokenMintColumn1746703312835'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" ADD "tokenMintAddress" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "tokenMintAddress"`);
    }

}
