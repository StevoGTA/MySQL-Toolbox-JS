//
//  OrderBy.js
//
//  Created by Stevo on 2/82022.
//  Copyright © 2022 Stevo Brock. All rights reserved.
//

/*
	Accepts the following arrangement of options:
		(tableColumn)			=> default order is ASC
		(tableColumn, order)
*/

//----------------------------------------------------------------------------------------------------------------------
// OrderBy
module.exports = class OrderBy {

	// Lifecycle methods
	//------------------------------------------------------------------------------------------------------------------
	constructor(...options) {
		// Validate
		if (options.length < 1)
			// Not enough info
			throw new Error('Where not enough parameters');
		else if (options.length > 2)
			// Too much info
			throw new Error('Where too many parameters');

		// Store
		this.tableColumn = options[0];
		this.order = (options.length == 2) ? options[1] : 'ASC';
	}

	// Instance methods
	//------------------------------------------------------------------------------------------------------------------
	toString() { return 'ORDER BY ' + this.tableColumn.mySQLName + ' ' + this.order; }
}
