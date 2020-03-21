const through = require('through2');

module.exports = function( targetArray ) {

	/**
	 * @this {Transform}
	 */
	var transform = function( file, encoding, callback ) {
		if( targetArray.length === undefined && !!file.Metadata.Id ) {
			targetArray[file.Metadata.Id] = file.Metadata;
		} else {
			targetArray.push( file.Metadata );
		}
		callback( null, file );
	};

	return through.obj( transform );
};
