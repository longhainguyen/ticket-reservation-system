import { MigrationInterface, QueryRunner } from "typeorm";

export class RealtionPaymentUser1726033438127 implements MigrationInterface {
    name = 'RealtionPaymentUser1726033438127'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payment\` DROP COLUMN \`amount\``);
        await queryRunner.query(`ALTER TABLE \`payment\` ADD \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`payment\` ADD UNIQUE INDEX \`IDX_b046318e0b341a7f72110b7585\` (\`userId\`)`);
        await queryRunner.query(`ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_33bcab3730355b8d90c7163716c\``);
        await queryRunner.query(`ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_0e01a7c92f008418bad6bad5919\``);
        await queryRunner.query(`ALTER TABLE \`ticket\` CHANGE \`bookedAt\` \`bookedAt\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`ticket\` CHANGE \`paymentId\` \`paymentId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`ticket\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`payment\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`payment\` ADD \`status\` enum ('PENDING', 'PAID', 'FAILED') NOT NULL DEFAULT 'PENDING'`);
        await queryRunner.query(`ALTER TABLE \`payment\` CHANGE \`paymentAt\` \`paymentAt\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`refreshToken\` \`refreshToken\` varchar(255) NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_b046318e0b341a7f72110b7585\` ON \`payment\` (\`userId\`)`);
        await queryRunner.query(`ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_33bcab3730355b8d90c7163716c\` FOREIGN KEY (\`paymentId\`) REFERENCES \`payment\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_0e01a7c92f008418bad6bad5919\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment\` ADD CONSTRAINT \`FK_b046318e0b341a7f72110b75857\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payment\` DROP FOREIGN KEY \`FK_b046318e0b341a7f72110b75857\``);
        await queryRunner.query(`ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_0e01a7c92f008418bad6bad5919\``);
        await queryRunner.query(`ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_33bcab3730355b8d90c7163716c\``);
        await queryRunner.query(`DROP INDEX \`REL_b046318e0b341a7f72110b7585\` ON \`payment\``);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`refreshToken\` \`refreshToken\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`payment\` CHANGE \`paymentAt\` \`paymentAt\` timestamp NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`payment\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`payment\` ADD \`status\` varchar(255) NOT NULL DEFAULT ''PENDING''`);
        await queryRunner.query(`ALTER TABLE \`ticket\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`ticket\` CHANGE \`paymentId\` \`paymentId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`ticket\` CHANGE \`bookedAt\` \`bookedAt\` timestamp NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_0e01a7c92f008418bad6bad5919\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_33bcab3730355b8d90c7163716c\` FOREIGN KEY (\`paymentId\`) REFERENCES \`payment\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment\` DROP INDEX \`IDX_b046318e0b341a7f72110b7585\``);
        await queryRunner.query(`ALTER TABLE \`payment\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`payment\` ADD \`amount\` decimal(10,0) NOT NULL`);
    }

}
