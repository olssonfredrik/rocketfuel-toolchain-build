const through = require('through2');
const bmfont2json = require('bmfont2json');

module.exports = function( targetObject ) {

	/**
	 * @this {Transform}
	 */
	var transform = function( file, encoding, callback ) {
		file.contents = Buffer.from( JSON.stringify( bmfont2json( file.contents ) ) );
		file.extname = '.json';
		callback( null, file );
	};

	return through.obj( transform );
};
