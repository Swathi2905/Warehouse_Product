exports.up = function (knex, Promise) {
    return knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('login_id');
        table.string('password');
        table.string('f_name');
        table.string('l_name');
        table.timestamp('created_on');
    }).createTable('warehouses', (table) => {
        table.increments('id').primary();
        table.string('name');
    }).createTable('products', (table) => {
        table.increments('id').primary();
        table.string('name');
        table.string('description');
    }).createTable('stocks', (table) => {
        table.increments('id').primary();
        table.integer('warehouse_id');
        table.integer('product_id')
        table.integer('quantity').notNullable();
        table.decimal('price_per_unit').notNullable();
    })
};

exports.down = function (knex, Promise) {
    return knex.schema
        .dropTable('users')
        .dropTable('warehouses')
        .dropTable('stocks')
        .dropTable('products')
}