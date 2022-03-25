//
//  Limit.js
//
//  Created by Stevo on 2/82022.
//  Copyright © 2022 Stevo Brock. All rights reserved.
//

/*
	Accepts the following arrangement of options:
		(limit)
*/

//----------------------------------------------------------------------------------------------------------------------
// Limit
module.exports = class Limit {

	// Lifecycle methods
	//------------------------------------------------------------------------------------------------------------------
	constructor(...options) {
		// Validate
		if (options.length < 1)
			// Not enough info
			throw new Error('Where not enough parameters');
		else if (options.length > 1)
			// Too much info
			throw new Error('Where too many parameters');

		// Store
		this.limit = options[0];
	}

	// Instance methods
	//------------------------------------------------------------------------------------------------------------------
	toString() { return 'LIMIT ' + this.limit; }
}
