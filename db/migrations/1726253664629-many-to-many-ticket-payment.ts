import { MigrationInterface, QueryRunner } from "typeorm";

export class ManyToManyTicketPayment1726253664629 implements MigrationInterface {
    name = 'ManyToManyTicketPayment1726253664629'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`payment_ticket\` (\`id\` int NOT NULL AUTO_INCREMENT, \`status\` enum ('paid', 'refund') NOT NULL, \`paymentId\` int NULL, \`ticketId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ticket\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`seat\` varchar(255) NOT NULL, \`price\` decimal NOT NULL, \`status\` enum ('available', 'pending', 'booked', 'expired') NOT NULL DEFAULT 'available', \`bookedAt\` timestamp NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NULL, UNIQUE INDEX \`IDX_da0813df70b170e061bce19831\` (\`name\`, \`seat\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`role\` enum ('user', 'admin') NOT NULL DEFAULT 'user', \`refreshToken\` varchar(255) NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`payment\` (\`id\` int NOT NULL AUTO_INCREMENT, \`paymentAt\` timestamp NULL, \`stripePaymentIntentId\` varchar(255) NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`payment_ticket\` ADD CONSTRAINT \`FK_386a6790fded4f746a35836389a\` FOREIGN KEY (\`paymentId\`) REFERENCES \`payment\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment_ticket\` ADD CONSTRAINT \`FK_f4b09c34a4908026e99ed71bd28\` FOREIGN KEY (\`ticketId\`) REFERENCES \`ticket\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_0e01a7c92f008418bad6bad5919\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment\` ADD CONSTRAINT \`FK_b046318e0b341a7f72110b75857\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payment\` DROP FOREIGN KEY \`FK_b046318e0b341a7f72110b75857\``);
        await queryRunner.query(`ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_0e01a7c92f008418bad6bad5919\``);
        await queryRunner.query(`ALTER TABLE \`payment_ticket\` DROP FOREIGN KEY \`FK_f4b09c34a4908026e99ed71bd28\``);
        await queryRunner.query(`ALTER TABLE \`payment_ticket\` DROP FOREIGN KEY \`FK_386a6790fded4f746a35836389a\``);
        await queryRunner.query(`DROP TABLE \`payment\``);
        await queryRunner.query(`DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_da0813df70b170e061bce19831\` ON \`ticket\``);
        await queryRunner.query(`DROP TABLE \`ticket\``);
        await queryRunner.query(`DROP TABLE \`payment_ticket\``);
    }

}
