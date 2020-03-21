const through = require('through2');
const jsonMerger = require('json-merger');
 
module.exports = function( targetObject ) {

	/**
	 * @this {Transform}
	 */
	var transform = function( file, encoding, callback ) {
		var source = targetObject[ file.stem ] || {};
		targetObject[ file.stem ] = jsonMerger.mergeObjects( [ source, JSON.parse( file.contents ) ] );
		callback( null, file );
	};

	return through.obj( transform );
};
