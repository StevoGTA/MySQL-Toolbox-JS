//
//  Table.js
//
//  Created by Stevo on 2/82022.
//  Copyright © 2022 Stevo Brock. All rights reserved.
//

//----------------------------------------------------------------------------------------------------------------------
// Table
module.exports = class Table {

	// Properties

	// Lifecycle methods
	//------------------------------------------------------------------------------------------------------------------
	constructor(name, tableColumns) {
		// Store
		this.name = name;
		this.mySQLName = '`' + name + '`';
		this.tableColumns = tableColumns;

		// Setup
		for (let tableColumn of this.tableColumns) {
			// Store this table column as an individually referencable property
			this[tableColumn.name + 'TableColumn'] = tableColumn;

			// Store reference to table
			tableColumn.table = this;
		}
	}

	// Instance functions
	//------------------------------------------------------------------------------------------------------------------
	tableColumn(name) { return this[name + 'TableColumn']; }
}
