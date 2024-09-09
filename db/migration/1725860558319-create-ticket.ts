import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTicket1725860558319 implements MigrationInterface {
    name = 'CreateTicket1725860558319';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`ticket\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`price\` decimal NOT NULL, \`quantity\` int NOT NULL, \`status\` varchar(255) NOT NULL DEFAULT 'available', \`bookedBy\` varchar(255) NULL, \`bookedAt\` timestamp NULL, \`confirmedAt\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`ticket\``);
    }
}
