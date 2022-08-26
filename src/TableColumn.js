//
//  TableColumn.js
//
//  Created by Stevo on 2/82022.
//  Copyright © 2022 Stevo Brock. All rights reserved.
//

//----------------------------------------------------------------------------------------------------------------------
// Options

exports.options = {
	none:			0b00000000,
	primaryKey:		0b00000001,
	nonNull:		0b00000010,
	unique:			0b00000100,
	binary:			0b00001000,
	unsigned:		0b00010000,
	zeroFill:		0b00100000,
	autoIncrement:	0b01000000,
	generated:		0b10000000,
};

//----------------------------------------------------------------------------------------------------------------------
class TableColumn {

	// Lifecycle functions
	//------------------------------------------------------------------------------------------------------------------
	constructor(name, options, tableName) {
		// Store
		this.name = name;
		this.mySQLName = '`' + name + '`';
		this.mySQLNameWithTable = (tableName ? '`' + tableName + '`.' : '') + '`' + name + '`';
		this.options = options;
	}

	// Instance methods
	//------------------------------------------------------------------------------------------------------------------
	getNameAs(asName) { return this.mySQLName + (asName ? ' AS ' + asName : ''); }

	//------------------------------------------------------------------------------------------------------------------
	getNameWithTableAs(asName) { return this.mySQLNameWithTable + (asName ? ' AS ' + asName : ''); }
};

//----------------------------------------------------------------------------------------------------------------------
exports.CHAR = class TableColumnCHAR extends TableColumn {

	// Lifecycle functions
	//------------------------------------------------------------------------------------------------------------------
	constructor(name, options, width, tableName) {
		// Do super
		super(name, options, tableName);

		// Store
		this.width = width;
	}
};

//----------------------------------------------------------------------------------------------------------------------
exports.TINYINT = class TableColumnTINYINT extends TableColumn {

	// Lifecycle functions
	//------------------------------------------------------------------------------------------------------------------
	constructor(name, options, tableName) {
		// Do super
		super(name, options, tableName);
	}
};

//----------------------------------------------------------------------------------------------------------------------
exports.SMALLINT = class TableColumnSMALLINT extends TableColumn {

	// Lifecycle functions
	//------------------------------------------------------------------------------------------------------------------
	constructor(name, options, tableName) {
		// Do super
		super(name, options, tableName);
	}
};

//----------------------------------------------------------------------------------------------------------------------
exports.MEDIUMINT = class TableColumnMEDIUMINT extends TableColumn {

	// Lifecycle functions
	//------------------------------------------------------------------------------------------------------------------
	constructor(name, options, tableName) {
		// Do super
		super(name, options, tableName);
	}
};

//----------------------------------------------------------------------------------------------------------------------
exports.INT = class TableColumnINT extends TableColumn {

	// Lifecycle functions
	//------------------------------------------------------------------------------------------------------------------
	constructor(name, options, tableName) {
		// Do super
		super(name, options, tableName);
	}
};

//----------------------------------------------------------------------------------------------------------------------
exports.BIGINT = class TableColumnBIGINT extends TableColumn {

	// Lifecycle functions
	//------------------------------------------------------------------------------------------------------------------
	constructor(name, options, tableName) {
		// Do super
		super(name, options, tableName);
	}
};

//----------------------------------------------------------------------------------------------------------------------
exports.LONGBLOB = class TableColumnLONGBLOB extends TableColumn {

	// Lifecycle functions
	//------------------------------------------------------------------------------------------------------------------
	constructor(name, options, tableName) {
		// Do super
		super(name, options, tableName);
	}
};

//----------------------------------------------------------------------------------------------------------------------
exports.VARCHAR = class TableColumnVARCHAR extends TableColumn {

	// Lifecycle functions
	//------------------------------------------------------------------------------------------------------------------
	constructor(name, options, width, tableName) {
		// Do super
		super(name, options, tableName);

		// Store
		this.width = width;
	}
};
