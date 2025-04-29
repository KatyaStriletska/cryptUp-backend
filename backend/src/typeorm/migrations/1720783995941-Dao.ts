import { MigrationInterface, QueryRunner } from "typeorm";

export class Dao1720783995941 implements MigrationInterface {
    name = 'Dao1720783995941'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "dao" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "multisigPda" text NOT NULL, "vaultPda" text NOT NULL, "threshold" bigint NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE, "removedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_4daffbc13cc700ca118098230a9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "dao_members_user" ("daoId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_07e0cbb6c5dfa033aac31bef3ae" PRIMARY KEY ("daoId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_854b1a562bbaa26e8a5147e725" ON "dao_members_user" ("daoId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2a0e4418b8bb93653fdf408404" ON "dao_members_user" ("userId") `);
        await queryRunner.query(`CREATE TABLE "user_daos_dao" ("userId" uuid NOT NULL, "daoId" uuid NOT NULL, CONSTRAINT "PK_3b63016d3025275e92c6257d74c" PRIMARY KEY ("userId", "daoId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4f25c45b10badc8d66871252c0" ON "user_daos_dao" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_96db708f3ee2c5a7f2ca0c7b9a" ON "user_daos_dao" ("daoId") `);
        await queryRunner.query(`ALTER TABLE "dao_members_user" ADD CONSTRAINT "FK_854b1a562bbaa26e8a5147e7252" FOREIGN KEY ("daoId") REFERENCES "dao"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "dao_members_user" ADD CONSTRAINT "FK_2a0e4418b8bb93653fdf408404e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_daos_dao" ADD CONSTRAINT "FK_4f25c45b10badc8d66871252c04" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_daos_dao" ADD CONSTRAINT "FK_96db708f3ee2c5a7f2ca0c7b9ae" FOREIGN KEY ("daoId") REFERENCES "dao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_daos_dao" DROP CONSTRAINT "FK_96db708f3ee2c5a7f2ca0c7b9ae"`);
        await queryRunner.query(`ALTER TABLE "user_daos_dao" DROP CONSTRAINT "FK_4f25c45b10badc8d66871252c04"`);
        await queryRunner.query(`ALTER TABLE "dao_members_user" DROP CONSTRAINT "FK_2a0e4418b8bb93653fdf408404e"`);
        await queryRunner.query(`ALTER TABLE "dao_members_user" DROP CONSTRAINT "FK_854b1a562bbaa26e8a5147e7252"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_96db708f3ee2c5a7f2ca0c7b9a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4f25c45b10badc8d66871252c0"`);
        await queryRunner.query(`DROP TABLE "user_daos_dao"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2a0e4418b8bb93653fdf408404"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_854b1a562bbaa26e8a5147e725"`);
        await queryRunner.query(`DROP TABLE "dao_members_user"`);
        await queryRunner.query(`DROP TABLE "dao"`);
    }

}
