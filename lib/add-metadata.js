const through = require('through2');

module.exports = function( metadataFunction, param ) {

	/**
	 * @this {Transform}
	 */
	var transform = function( file, encoding, callback ) {
		file.Metadata = metadataFunction( file, param );
		callback( null, file );
	};

	return through.obj( transform );
};
