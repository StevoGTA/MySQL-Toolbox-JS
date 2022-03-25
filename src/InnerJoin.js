//
//  InnerJoin.js
//
//  Created by Stevo on 2/82022.
//  Copyright © 2022 Stevo Brock. All rights reserved.
//

/*
	Accepts the following arrangement of options:
		(table, tableColumn)
		(table, tableColumn, joinTableColumn)
		[(table, tableColumn)]
		[(table, tableColumn, joinTableColumn)]
*/

//----------------------------------------------------------------------------------------------------------------------
// InnerJoinClause
class InnerJoinClause {

	// Lifecycle methods
	//------------------------------------------------------------------------------------------------------------------
	constructor(...options) {
		// Validate
		if (options.length < 2)
			// Not enough info
			throw new Error('InnerJoinClause not enough parameters');
		else if (options.length > 3)
			// Too much info
			throw new Error('InnerJoinClause too many parameters');

		// Store
		this.table = options[0];
		this.tableColumn = options[1];
		this.joinTableColumn = (options.length == 3) ? options[2] : options[1];
	}

	// Instance methods
	//------------------------------------------------------------------------------------------------------------------
	toString(table) {
		// Return string
		return 'INNER JOIN ' + this.table.mySQLName + ' ON ' +
				this.table.mySQLName + '.' + this.joinTableColumn.mySQLName + ' = ' +
				table.mySQLName + '.' + this.tableColumn.mySQLName;
	}
}

//----------------------------------------------------------------------------------------------------------------------
// InnerJoin
module.exports = class InnerJoin {

	// Lifecycle methods
	//------------------------------------------------------------------------------------------------------------------
	constructor(...info) {
		// Compose clauses
		if (info.length == 1) {
			// Single argument
			if (Array.isArray(info[0]))
				// Array of options
				this.clauses = info[0].map(options => new InnerJoinClause(options));
			else
				// Not enough options
				throw new Error('InnerJoin not enough parameters');
		} else
			// Multiple arguments => single clause
			this.clauses = [new InnerJoinClause(...info)];
	}

	// Instance methods
	//------------------------------------------------------------------------------------------------------------------
	toString(table) {
		// Return string
		return this.clauses.map(clause => clause.toString(table)).join(' ');
	}
}
