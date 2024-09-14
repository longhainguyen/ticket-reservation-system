import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAmountPayment1726329404991 implements MigrationInterface {
    name = 'AddAmountPayment1726329404991'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payment\` ADD \`amount\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`refreshToken\` \`refreshToken\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`payment\` DROP FOREIGN KEY \`FK_b046318e0b341a7f72110b75857\``);
        await queryRunner.query(`ALTER TABLE \`payment\` CHANGE \`paymentAt\` \`paymentAt\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`payment\` CHANGE \`stripePaymentIntentId\` \`stripePaymentIntentId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`payment\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`payment_ticket\` DROP FOREIGN KEY \`FK_386a6790fded4f746a35836389a\``);
        await queryRunner.query(`ALTER TABLE \`payment_ticket\` DROP FOREIGN KEY \`FK_f4b09c34a4908026e99ed71bd28\``);
        await queryRunner.query(`ALTER TABLE \`payment_ticket\` CHANGE \`paymentId\` \`paymentId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`payment_ticket\` CHANGE \`ticketId\` \`ticketId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`ticket\` CHANGE \`bookedAt\` \`bookedAt\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`payment\` ADD CONSTRAINT \`FK_b046318e0b341a7f72110b75857\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment_ticket\` ADD CONSTRAINT \`FK_386a6790fded4f746a35836389a\` FOREIGN KEY (\`paymentId\`) REFERENCES \`payment\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment_ticket\` ADD CONSTRAINT \`FK_f4b09c34a4908026e99ed71bd28\` FOREIGN KEY (\`ticketId\`) REFERENCES \`ticket\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payment_ticket\` DROP FOREIGN KEY \`FK_f4b09c34a4908026e99ed71bd28\``);
        await queryRunner.query(`ALTER TABLE \`payment_ticket\` DROP FOREIGN KEY \`FK_386a6790fded4f746a35836389a\``);
        await queryRunner.query(`ALTER TABLE \`payment\` DROP FOREIGN KEY \`FK_b046318e0b341a7f72110b75857\``);
        await queryRunner.query(`ALTER TABLE \`ticket\` CHANGE \`bookedAt\` \`bookedAt\` timestamp NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`payment_ticket\` CHANGE \`ticketId\` \`ticketId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`payment_ticket\` CHANGE \`paymentId\` \`paymentId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`payment_ticket\` ADD CONSTRAINT \`FK_f4b09c34a4908026e99ed71bd28\` FOREIGN KEY (\`ticketId\`) REFERENCES \`ticket\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment_ticket\` ADD CONSTRAINT \`FK_386a6790fded4f746a35836389a\` FOREIGN KEY (\`paymentId\`) REFERENCES \`payment\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`payment\` CHANGE \`stripePaymentIntentId\` \`stripePaymentIntentId\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`payment\` CHANGE \`paymentAt\` \`paymentAt\` timestamp NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`payment\` ADD CONSTRAINT \`FK_b046318e0b341a7f72110b75857\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`refreshToken\` \`refreshToken\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`payment\` DROP COLUMN \`amount\``);
    }

}
