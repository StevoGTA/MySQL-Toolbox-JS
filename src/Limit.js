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
		if (options.length < 2)
			// Not enough info
			throw new Error('Where not enough parameters');
		else if (options.length == 2) {
			// Store
			this.startIndex = options[0];
			this.limit = options[1];
		} else
			// Too much info
			throw new Error('Where too many parameters');
	}

	// Instance methods
	//------------------------------------------------------------------------------------------------------------------
	toString() {
		// Check situation
		if ((this.startIndex != null) && (this.limit != null))
			return 'LIMIT ' + this.startIndex + ',' + this.limit;
		else if (this.startIndex != null)
			return 'LIMIT ' + this.startIndex + ',18446744073709551615';
		else
			return 'LIMIT ' + this.limit;
	}
}
