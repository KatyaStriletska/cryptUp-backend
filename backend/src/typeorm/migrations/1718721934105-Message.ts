import { MigrationInterface, QueryRunner } from "typeorm";

export class Message1718721934105 implements MigrationInterface {
    name = 'Message1718721934105'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "message_seen_by_user" ("messageId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_5545e39eb43745eed713928a904" PRIMARY KEY ("messageId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c2b3de805019bb020f0440e018" ON "message_seen_by_user" ("messageId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d72d46b46ab9df6e18671327dd" ON "message_seen_by_user" ("userId") `);
        await queryRunner.query(`ALTER TABLE "message_seen_by_user" ADD CONSTRAINT "FK_c2b3de805019bb020f0440e018b" FOREIGN KEY ("messageId") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "message_seen_by_user" ADD CONSTRAINT "FK_d72d46b46ab9df6e18671327dd2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message_seen_by_user" DROP CONSTRAINT "FK_d72d46b46ab9df6e18671327dd2"`);
        await queryRunner.query(`ALTER TABLE "message_seen_by_user" DROP CONSTRAINT "FK_c2b3de805019bb020f0440e018b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d72d46b46ab9df6e18671327dd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c2b3de805019bb020f0440e018"`);
        await queryRunner.query(`DROP TABLE "message_seen_by_user"`);
    }

}
