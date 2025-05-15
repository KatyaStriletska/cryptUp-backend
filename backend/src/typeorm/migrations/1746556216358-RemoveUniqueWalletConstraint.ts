import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUniqueWalletConstraint1746556216358 implements MigrationInterface {
    name = 'RemoveUniqueWalletConstraint1746556216358'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_922e8c1d396025973ec81e2a402"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_922e8c1d396025973ec81e2a402" UNIQUE ("walletId"`);
    }

}
