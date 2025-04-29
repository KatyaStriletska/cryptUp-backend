import { MigrationInterface, QueryRunner } from "typeorm";

export class Chats1718693850387 implements MigrationInterface {
    name = 'Chats1718693850387'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_to_chat" ("userId" uuid NOT NULL, "chatId" uuid NOT NULL, CONSTRAINT "PK_e3764e17cf4d4c1bbd16d10a366" PRIMARY KEY ("userId", "chatId"))`);
        await queryRunner.query(`CREATE TABLE "message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isPinned" boolean NOT NULL DEFAULT false, "content" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE, "removedAt" TIMESTAMP WITH TIME ZONE, "replyToId" uuid, "authorId" uuid, "chatId" uuid, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chat" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255), "image" character varying(255), "description" text, "isGroup" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE, "removedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_9d0b2ba74336710fd31154738a5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_archived_chats_chat" ("userId" uuid NOT NULL, "chatId" uuid NOT NULL, CONSTRAINT "PK_22806f565ea61f600a4794051d1" PRIMARY KEY ("userId", "chatId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2a82ceb387cdfeda2f043760c7" ON "user_archived_chats_chat" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_bf4946e074d9cdf2642c79a595" ON "user_archived_chats_chat" ("chatId") `);
        await queryRunner.query(`CREATE TABLE "user_favourite_chats_chat" ("userId" uuid NOT NULL, "chatId" uuid NOT NULL, CONSTRAINT "PK_79a6922ce98a213065f15b283d7" PRIMARY KEY ("userId", "chatId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b3af91a84fd9be316650cc0439" ON "user_favourite_chats_chat" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_09ba31b422535bc9bc10a60e60" ON "user_favourite_chats_chat" ("chatId") `);
        await queryRunner.query(`ALTER TABLE "user_to_chat" ADD CONSTRAINT "FK_f321bfb45d74fb0bd05f3ef2a69" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_to_chat" ADD CONSTRAINT "FK_9bc649a84fe3f8feaebf4b9ad5e" FOREIGN KEY ("chatId") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_dc84d76f927b87f616cbedcf2e5" FOREIGN KEY ("replyToId") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_c72d82fa0e8699a141ed6cc41b3" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_619bc7b78eba833d2044153bacc" FOREIGN KEY ("chatId") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_archived_chats_chat" ADD CONSTRAINT "FK_2a82ceb387cdfeda2f043760c78" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_archived_chats_chat" ADD CONSTRAINT "FK_bf4946e074d9cdf2642c79a5953" FOREIGN KEY ("chatId") REFERENCES "chat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_favourite_chats_chat" ADD CONSTRAINT "FK_b3af91a84fd9be316650cc0439b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_favourite_chats_chat" ADD CONSTRAINT "FK_09ba31b422535bc9bc10a60e603" FOREIGN KEY ("chatId") REFERENCES "chat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_favourite_chats_chat" DROP CONSTRAINT "FK_09ba31b422535bc9bc10a60e603"`);
        await queryRunner.query(`ALTER TABLE "user_favourite_chats_chat" DROP CONSTRAINT "FK_b3af91a84fd9be316650cc0439b"`);
        await queryRunner.query(`ALTER TABLE "user_archived_chats_chat" DROP CONSTRAINT "FK_bf4946e074d9cdf2642c79a5953"`);
        await queryRunner.query(`ALTER TABLE "user_archived_chats_chat" DROP CONSTRAINT "FK_2a82ceb387cdfeda2f043760c78"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_619bc7b78eba833d2044153bacc"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_c72d82fa0e8699a141ed6cc41b3"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_dc84d76f927b87f616cbedcf2e5"`);
        await queryRunner.query(`ALTER TABLE "user_to_chat" DROP CONSTRAINT "FK_9bc649a84fe3f8feaebf4b9ad5e"`);
        await queryRunner.query(`ALTER TABLE "user_to_chat" DROP CONSTRAINT "FK_f321bfb45d74fb0bd05f3ef2a69"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_09ba31b422535bc9bc10a60e60"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b3af91a84fd9be316650cc0439"`);
        await queryRunner.query(`DROP TABLE "user_favourite_chats_chat"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bf4946e074d9cdf2642c79a595"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2a82ceb387cdfeda2f043760c7"`);
        await queryRunner.query(`DROP TABLE "user_archived_chats_chat"`);
        await queryRunner.query(`DROP TABLE "chat"`);
        await queryRunner.query(`DROP TABLE "message"`);
        await queryRunner.query(`DROP TABLE "user_to_chat"`);
    }

}
