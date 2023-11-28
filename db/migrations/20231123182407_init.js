/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
  .createTable("manager", (table) => {
   // table.increments("manager_id").primary();
   table.integer('manager_id').unsigned().notNullable().primary();
    table.string("email").notNullable().unique();
    table.string("department");
  })
    .createTable("employee", (table) => {
      table.increments("employee_id").primary();
      table.string("first_name").notNullable();
      table.string("last_name").notNullable();
      table.date("dob").notNullable();
      table.enum("gender", ['male', 'female', 'other']).notNullable();
      table.enum("role", ["employee", "manager", "admin"]).notNullable();
      table.string("email").notNullable().unique();
      table.string("phone").notNullable();
      table.string("department");
      table.integer("manager_id").unsigned().nullable();
      table.string("address").notNullable();
      table.date("join_date").notNullable().defaultTo(knex.fn.now());
      table.string("password").notNullable();

      // Foreign key reference to manager table
      table.foreign("manager_id").references("manager.manager_id").onDelete('SET NULL');
    });
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("employee").dropTableIfExists("manager");
};
