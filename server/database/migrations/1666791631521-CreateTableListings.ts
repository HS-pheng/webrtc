import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class CreateTableListings1666791631521 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'listings',
        columns: [
          new TableColumn({
            name: 'id',
            type: 'int',
            isPrimary: true,
            isUnique: true,
            isGenerated: true,
            generationStrategy: 'increment',
          }),
          new TableColumn({
            name: 'title',
            type: 'varchar',
            isNullable: false,
          }),
          new TableColumn({
            name: 'description',
            type: 'varchar',
            isNullable: false,
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('listings');
  }
}
