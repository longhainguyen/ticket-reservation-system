import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTicket1725870675836 implements MigrationInterface {
    name = 'CreateTicket1725870675836';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`ticket\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`price\` decimal NOT NULL, \`quantity\` int NOT NULL, \`status\` enum ('available', 'pending', 'booked', 'expired') NOT NULL DEFAULT 'available', \`bookedBy\` varchar(255) NULL, \`bookedAt\` timestamp NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`ticket\``);
    }
}
