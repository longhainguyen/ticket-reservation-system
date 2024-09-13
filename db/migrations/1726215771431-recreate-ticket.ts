import { MigrationInterface, QueryRunner } from "typeorm";

export class RecreateTicket1726215771431 implements MigrationInterface {
    name = 'RecreateTicket1726215771431'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_161a570937be2a1fbabf179e2b\` ON \`ticket\``);
        await queryRunner.query(`ALTER TABLE \`ticket\` CHANGE \`type\` \`seat\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_33bcab3730355b8d90c7163716c\``);
        await queryRunner.query(`ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_0e01a7c92f008418bad6bad5919\``);
        await queryRunner.query(`ALTER TABLE \`ticket\` DROP COLUMN \`seat\``);
        await queryRunner.query(`ALTER TABLE \`ticket\` ADD \`seat\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`ticket\` CHANGE \`bookedAt\` \`bookedAt\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`ticket\` CHANGE \`paymentId\` \`paymentId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`ticket\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`payment\` DROP FOREIGN KEY \`FK_b046318e0b341a7f72110b75857\``);
        await queryRunner.query(`ALTER TABLE \`payment\` CHANGE \`paymentAt\` \`paymentAt\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`payment\` CHANGE \`stripePaymentIntentId\` \`stripePaymentIntentId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`payment\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`refreshToken\` \`refreshToken\` varchar(255) NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_da0813df70b170e061bce19831\` ON \`ticket\` (\`name\`, \`seat\`)`);
        await queryRunner.query(`ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_33bcab3730355b8d90c7163716c\` FOREIGN KEY (\`paymentId\`) REFERENCES \`payment\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_0e01a7c92f008418bad6bad5919\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment\` ADD CONSTRAINT \`FK_b046318e0b341a7f72110b75857\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payment\` DROP FOREIGN KEY \`FK_b046318e0b341a7f72110b75857\``);
        await queryRunner.query(`ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_0e01a7c92f008418bad6bad5919\``);
        await queryRunner.query(`ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_33bcab3730355b8d90c7163716c\``);
        await queryRunner.query(`DROP INDEX \`IDX_da0813df70b170e061bce19831\` ON \`ticket\``);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`refreshToken\` \`refreshToken\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`payment\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`payment\` CHANGE \`stripePaymentIntentId\` \`stripePaymentIntentId\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`payment\` CHANGE \`paymentAt\` \`paymentAt\` timestamp NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`payment\` ADD CONSTRAINT \`FK_b046318e0b341a7f72110b75857\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ticket\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`ticket\` CHANGE \`paymentId\` \`paymentId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`ticket\` CHANGE \`bookedAt\` \`bookedAt\` timestamp NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`ticket\` DROP COLUMN \`seat\``);
        await queryRunner.query(`ALTER TABLE \`ticket\` ADD \`seat\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_0e01a7c92f008418bad6bad5919\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_33bcab3730355b8d90c7163716c\` FOREIGN KEY (\`paymentId\`) REFERENCES \`payment\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ticket\` CHANGE \`seat\` \`type\` varchar(255) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_161a570937be2a1fbabf179e2b\` ON \`ticket\` (\`name\`, \`type\`)`);
    }

}
