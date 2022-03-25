//
//  StatementPerformer.js
//
//  Created by Stevo on 1/19/2022.
//  Copyright © 2022 Stevo Brock. All rights reserved.
//

// Imports
let	mysql = require('mysql');

let	InnerJoin = require('./InnerJoin');
let	Limit = require('./Limit');
let	OrderBy = require('./OrderBy');
let	Table = require('./Table');
let	TableColumn = require('./TableColumn');
let	Where = require('./Where');

//----------------------------------------------------------------------------------------------------------------------
// StatementPerformer
module.exports = class StatementPerformer {

	// Properties
	keepOpenLevel = 0;
	statements = [];

	// Lifecycle methods
	//------------------------------------------------------------------------------------------------------------------
	constructor(config) {
		// Store
		this.config = config;
	}

	// Instance methods
	//------------------------------------------------------------------------------------------------------------------
	innerJoin(...options) { return new InnerJoin(...options); }

	//------------------------------------------------------------------------------------------------------------------
	limit(...options) { return new Limit(...options); }

	//------------------------------------------------------------------------------------------------------------------
	orderBy(...options) { return new OrderBy(...options); }

	//------------------------------------------------------------------------------------------------------------------
	table(name, tableColumns) { return new Table(name, tableColumns); }

	//------------------------------------------------------------------------------------------------------------------
	tableColumn() { return TableColumn; }

	//------------------------------------------------------------------------------------------------------------------
	where(...options) { return new Where(...options); }

	//------------------------------------------------------------------------------------------------------------------
	use(database) {
		// Setup
		if (this.connection && (this.database != database))
			// Queue
			this.statements.push('USE ' + database + ';');

		// Update
		this.database = database;
	}

	//------------------------------------------------------------------------------------------------------------------
	async select(table, ...options) {
		// Setup
		let	THIS = this;

		var	tableColumns = '*';
		var	innerJoin = null;
		var	limit = null;
		var	orderBy = null;
		var	where = null;

		for (let option of options) {
			// Check option type
			if (Array.isArray(option))
				// Array
				tableColumns = option;
			else if ((typeof option === 'string') || (option instanceof String))
				// String
				tableColumns = option;
			else if (option instanceof InnerJoin)
				// Inner Join
				innerJoin = option;
			else if (option instanceof Limit)
				// Limit
				limit = option;
			else if (option instanceof OrderBy)
				// Order By
				orderBy = option;
			else if (option instanceof Where)
				// Where
				where = option;
		}

		let	{mySQLResults, results} =
					await this.batch(function(statementPerformer) {
						// Compose SQL
						var	statement =
									'SELECT ' +
											(Array.isArray(tableColumns) ?
													tableColumns.map(tableColumn =>
															tableColumn.mySQLNameWithTable).join() : tableColumns) +
											' FROM ' + table.mySQLName;
						if (innerJoin)
							// Add inner join info
							statement += ' ' + innerJoin.toString(table);
						if (where)
							// Add where info
							statement += ' ' + where.toString(value => THIS.transformValue(value));
						if (orderBy)
							// Add order by info
							statement += ' ' + orderBy.toString();
						if (limit)
							// Add limit info
							statement += ' ' + limit.toString();
						statement += ';';

						// Add statement
						THIS.statements.push(statement);
					});
		
		return mySQLResults;
	}

	//------------------------------------------------------------------------------------------------------------------
	async count(table, where) {
		// Perform
		let	mySQLResults = await this.select(table, "COUNT(*)", where);

		return mySQLResults[0]['COUNT(*)'];
	}
	//------------------------------------------------------------------------------------------------------------------
	async batch(proc) {
		// Setup
		if (!this.connection) {
			// Setup
			this.connection = mysql.createConnection(this.config);
			this.needUSE = true;
		}

		// One more level
		this.keepOpenLevel++;
// console.log("keepOpenLevel now: ", this.keepOpenLevel);

		// Call proc
		//	Proc may do any number of things:
		//		Most likely will be just adding statements, in which case results will be undefined.
		//		May not add any statements but be a general wrapper to keep the connection open, in which case we want
		//			to capture the results, and since no statements will be added, the results will be passed through to
		//			the caller unchanged.
		var	results = await proc(this);

		// Check if have statements
		var	mySQLResults = null;
		var	performError = null;
		if (this.statements.length > 0) {
			// Compose SQL
			let	sql = (this.needUSE ? 'USE ' + this.database + ';' : '') + this.statements.join('');
console.log("SQL: ", sql);
			this.needUSE = false;
			this.statements = [];

			// Catch errors
			try {
				// Perform
				let	connection = this.connection;
				mySQLResults = await new Promise((resolve, reject) => {
					// Query
					connection.query(sql, function(error, results, fields) {
						// Handle results
						if (!error)
							// Success
							resolve(
									(Array.isArray(results)) ?
											[]
													.concat
													.apply([], results)
													.filter(object => object.constructor.name == "RowDataPacket") :
											results);
						else
							// Error
							reject(error);
					})
				});
			} catch (error) {
				// Error
				performError = error;
			}
		}
		
		// Done
		if (--this.keepOpenLevel == 0) {
			// All done
// console.log("Destroying connection with keepOpenLevel: ", this.keepOpenLevel);
			this.connection.destroy();
			this.connection = null;
			this.needUSE = true;
		}
		// } else
// console.log("Not destroying connection with keepOpenLevel: ", this.keepOpenLevel);

		if (!performError)
			// Success
			return {mySQLResults, results};
		else
			// Error
			throw performError;
	}

	//------------------------------------------------------------------------------------------------------------------
	async batchLockedForWrite(tables, proc) {
		// Batch
		let	{mySQLResults, results} =
					await this.batch(
							statementPerformer => { return (async() => {
								// Setup
								let	info = [];
								for (let table of tables)
									// Add info
									info.push({table: table, type: 'WRITE'});

								// Lock tables
								statementPerformer.queueLockTables(info);

								// Call  proc
								let	results = await proc(statementPerformer);

								// Unlock tables
								statementPerformer.queueUnlockTables();

								return results;
							})()});
		
		return results;
	}

	//------------------------------------------------------------------------------------------------------------------
	queueCreateTable(table) {
		// Compose statement
		var	primaryKey = '';
		var	uniqueKeys ='';

		var	statement = 'CREATE TABLE IF NOT EXISTS ' + table.mySQLName + ' (';
		for (var i = 0; i < table.tableColumns.length; i++) {
			// Setup
			let	tableColumn = table.tableColumns[i];

			// Add table column info
			statement += tableColumn.mySQLName + ' ';
			if (tableColumn instanceof TableColumn.CHAR)
				// CHAR
				statement += 'CHAR(' + tableColumn.width + ')';
			else if (tableColumn instanceof TableColumn.TINYINT)
				// TINYINT
				statement += 'INT(4)';
			else if (tableColumn instanceof TableColumn.SMALLINT)
				// SMALLINT
				statement += 'INT(6)';
			else if (tableColumn instanceof TableColumn.MEDIUMINT)
				// MEDIUMINT
				statement += 'INT(8)';
			else if (tableColumn instanceof TableColumn.INT)
				// INT
				statement += 'INT(11)';
			else if (tableColumn instanceof TableColumn.BIGINT)
				// BIGINT
				statement += 'INT(20)';
			else if (tableColumn instanceof TableColumn.LONGBLOB)
				// LONGBLOB
				statement += 'LONGBLOB';
			else
				// VARCHAR
				statement += 'VARCHAR(' + tableColumn.width + ')';

			if (tableColumn.options & TableColumn.options.unsigned)
				// Unsigned
				statement += ' UNSIGNED';
			if (tableColumn.options & TableColumn.options.nonNull)
				// Non null
				statement += ' NOT NULL';
			if (tableColumn.options & TableColumn.options.autoIncrement)
				// Auto-increment
				statement += ' AUTO_INCREMENT';

			if (tableColumn.options & TableColumn.options.primaryKey)
				// Primary key
				primaryKey = ', PRIMARY KEY (' + tableColumn.mySQLName + ')';

			if (tableColumn.options & TableColumn.options.unique)
				// Unique
				uniqueKeys += ', UNIQUE KEY `' + tableColumn.name + '_UNIQUE` (' + tableColumn.mySQLName + ')';

			if (i < (table.tableColumns.length - 1))
				// Prepare for another table column
				statement += ', ';
		}
		statement += primaryKey + uniqueKeys + ');';

		// Queue
		this.statements.push(statement);
	}

	//------------------------------------------------------------------------------------------------------------------
	queueDelete(table, where) {
		// Push statement
		this.statements.push(
				'DELETE FROM ' + table.mySQLName + where.toString(value => this.transformValue(value)) + ';');
	}

	//------------------------------------------------------------------------------------------------------------------
	queueInsertInto(table, tableColumnsAndValues) {
		// Push statement
		this.statements.push(
				'INSERT INTO ' + table.mySQLName +
						' (' + this.tableColumnsAndValuesToTableColumnsString(tableColumnsAndValues) +
						') VALUES (' + this.tableColumnsAndValuesToValuesString(tableColumnsAndValues) + ');');
	}

	//------------------------------------------------------------------------------------------------------------------
	queueLockTables(infos) {
		// Push statement
		this.statements.push('LOCK TABLES ' + infos.map(info => info.table.mySQLName + ' ' + info.type).join() + ';');
	}

	//------------------------------------------------------------------------------------------------------------------
	queueReplace(table, tableColumnsAndValues) {
		// Push statement
		this.statements.push(
				'REPLACE ' + table.mySQLName +
						' (' + this.tableColumnsAndValuesToTableColumnsString(tableColumnsAndValues) +
						') VALUES (' + this.tableColumnsAndValuesToValuesString(tableColumnsAndValues) + ');');
	}

	//------------------------------------------------------------------------------------------------------------------
	queueSet(name, value) {
		// Push statement
		this.statements.push('SET ' + name + " = " + value + ';');
	}

	//------------------------------------------------------------------------------------------------------------------
	queueTruncateTable(table) { this.statements.push('TRUNCATE TABLE ' + table.mySQLName + ';'); }

	//------------------------------------------------------------------------------------------------------------------
	queueUnlockTables() {
		// Push statement
		this.statements.push('UNLOCK TABLES;');
	}

	//------------------------------------------------------------------------------------------------------------------
	queueUpdate(table, tableColumnsAndValues, where) {
		// Setup
		let	tableColumnsAndValuesString =
					tableColumnsAndValues
							.map(tableColumnAndValue =>
									tableColumnAndValue.tableColumn.mySQLName + '=' +
											this.transformValue(tableColumnAndValue.value))
							.join();

		// Push statement
		this.statements.push(
				'UPDATE ' + table.mySQLName + ' SET ' + tableColumnsAndValuesString + ' ' +
						where.toString(value => this.transformValue(value)) + ';');
	}

	// MARK: Private methods
	//------------------------------------------------------------------------------------------------------------------
	tableColumnsAndValuesToTableColumnsString(tableColumnsAndValues) {
		// Return string
		return tableColumnsAndValues.map(info => info.tableColumn.mySQLNameWithTable).join();
	}

	//------------------------------------------------------------------------------------------------------------------
	tableColumnsAndValuesToValuesString(tableColumnsAndValues) {
		// Setup
		let	THIS = this;

		return tableColumnsAndValues.map(info => {
			// Check situation
			if (info.variable)
				// Have variable
				return info.variable;
			else if ((info.tableColumn instanceof TableColumn.LONGBLOB) && (info.value instanceof Buffer))
				// Convert data to Base64
				return '0x' + info.value.toString("hex");
			else
				// Transform
				return THIS.transformValue(info.value);
		}).join();
	}

	//------------------------------------------------------------------------------------------------------------------
	transformValue(value) {
		// Check value
		if (value == 'LAST_INSERT_ID()')
			// All ready to go
			return value;
		else if (typeof value === 'object')
			// Object
			return this.connection.escape(JSON.stringify(value));
		else
			// Other
			return this.connection.escape(value);
	}
}