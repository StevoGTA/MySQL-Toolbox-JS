//
//  Where.js
//
//  Created by Stevo on 2/82022.
//  Copyright © 2022 Stevo Brock. All rights reserved.
//

/*
	Accepts the following arrangement of options:
		(tableColumn, value)
		(tableColumn, values)
		(tableColumn, comparison, value)
		(tableColumn, other tableColumn)
		[(tableColumn, value)]
		[(tableColumn, values)]
		[(tableColumn, comparison, value)]
		[(tableColumn, other tableColumn)]
*/

// Imports
let	TableColumn = require('./TableColumn');

//----------------------------------------------------------------------------------------------------------------------
class WhereClause {

	// Lifecycle methods
	//------------------------------------------------------------------------------------------------------------------
	constructor(...options) {
		// Check options length
		if (options.length < 1)
			// Not enough info
			throw new Error('Where not enough parameters');
		else if (options.length == 1) {
			//  Check type
			if (options[0] instanceof Object) {
				// We were given an object
				this.tableColumn = options[0].tableColumn;
				this.value = options[0].value;
				this.values = options[0].values;
				this.comparison = options[0].comparison || '=';
				if (!this.tableColumn || (!this.value && !this.values))
					// Missing required info
					throw new Error('Missing required info');
			} else
				// Invalid parameter
				throw new Error('Where not enough parameters or wrong type of parameter');
		} else if (options.length == 2) {
			// Decode
			this.tableColumn = options[0];
			if (options.length == 2) {
				// Check type
				if (Array.isArray(options[1]))
					// (tableColumn, values)
					this.values = options[1];
				else if (options[1] instanceof Object)
					// (tableColumn, other tableColumn)
					this.otherTableColumn = options[1];
				else {
					// (tableColumn, value)
					this.comparison = '=';
					this.value = options[1];
				}
			} else if (options.length == 3) {
				// (tableColumn, comparison, value)
				this.comparison = options[1];
				this.value = options[2];
			}
		} else
			// Too much info
			throw new Error('Where too many parameters');
	}

	// Instance methods
	//------------------------------------------------------------------------------------------------------------------
	toString(valueTransformer) {
		// Compose this clause
		if (this.values)
			// (tableColumn, values)
			return this.tableColumn.mySQLName + ' IN (' +
					this.values.map(value => valueTransformer(value)).join() + ')';
		else if (this.otherTableColumn)
			// (tableColumn, other tableColumn)
			return this.tableColumn.table.mySQLName + '.' + this.tableColumn.mySQLName + ' = ' +
					this.otherTableColumn.table.mySQLName + '.' + this.otherTableColumn.mySQLName;
		else
			// (tableColumn, value)
			// (tableColumn, comparison, value)
			return this.tableColumn.mySQLName + ' ' + this.comparison + ' ' + valueTransformer(this.value);
	}
}

//----------------------------------------------------------------------------------------------------------------------
// Where
module.exports = class Where {

	// Lifecycle methods
	//------------------------------------------------------------------------------------------------------------------
	constructor(...info) {
		// Compose clauses
		if (info.length == 1) {
			// Single argument
			if (Array.isArray(info[0]))
				// Array of options
				this.clauses = info[0].map(options => new WhereClause(options));
			else
				// Not enough options
				throw new Error('Where not enough parameters');
		} else
			// Multiple arguments => single clause
			this.clauses = [new WhereClause(...info)];
	}

	// Instance methods
	//------------------------------------------------------------------------------------------------------------------
	toString(valueTransformer) {
		// Return string
		return 'WHERE ' + this.clauses.map(clause => clause.toString(valueTransformer)).join(' AND ');
	}
}
