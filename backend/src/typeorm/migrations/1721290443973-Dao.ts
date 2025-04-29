import { MigrationInterface, QueryRunner } from "typeorm";

export class Dao1721290443973 implements MigrationInterface {
    name = 'Dao1721290443973'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_daos_dao" DROP CONSTRAINT "FK_4f25c45b10badc8d66871252c04"`);
        await queryRunner.query(`ALTER TABLE "user_daos_dao" DROP CONSTRAINT "FK_96db708f3ee2c5a7f2ca0c7b9ae"`);
        await queryRunner.query(`ALTER TABLE "dao" DROP CONSTRAINT "FK_5aa10eeeac7b7dd16fb6e02d3eb"`);
        await queryRunner.query(`ALTER TABLE "dao" ALTER COLUMN "projectLaunchId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "dao" ADD CONSTRAINT "FK_5aa10eeeac7b7dd16fb6e02d3eb" FOREIGN KEY ("projectLaunchId") REFERENCES "project_launch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_daos_dao" ADD CONSTRAINT "FK_96db708f3ee2c5a7f2ca0c7b9ae" FOREIGN KEY ("daoId") REFERENCES "dao"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_daos_dao" ADD CONSTRAINT "FK_4f25c45b10badc8d66871252c04" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_daos_dao" DROP CONSTRAINT "FK_4f25c45b10badc8d66871252c04"`);
        await queryRunner.query(`ALTER TABLE "user_daos_dao" DROP CONSTRAINT "FK_96db708f3ee2c5a7f2ca0c7b9ae"`);
        await queryRunner.query(`ALTER TABLE "dao" DROP CONSTRAINT "FK_5aa10eeeac7b7dd16fb6e02d3eb"`);
        await queryRunner.query(`ALTER TABLE "dao" ALTER COLUMN "projectLaunchId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "dao" ADD CONSTRAINT "FK_5aa10eeeac7b7dd16fb6e02d3eb" FOREIGN KEY ("projectLaunchId") REFERENCES "project_launch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_daos_dao" ADD CONSTRAINT "FK_96db708f3ee2c5a7f2ca0c7b9ae" FOREIGN KEY ("daoId") REFERENCES "dao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_daos_dao" ADD CONSTRAINT "FK_4f25c45b10badc8d66871252c04" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
