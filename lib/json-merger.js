const through = require('through2');
const jsonMerger = require('json-merger');
const Vinyl = require('vinyl');

module.exports = function(filename) {

	var data = {};

	function processFile(file, encoding, callback) {

		if( file.isNull() || file.extname !== '.json' ) {
			callback( null, file );
			return;
		}

		data = jsonMerger.mergeObjects( [ data, JSON.parse( file.contents ) ] );

		callback();
	}


	function endStream(callback) {

		const output = new Vinyl( {
			path: filename,
			contents: Buffer.from( JSON.stringify( data ) )
		} );
		this.push( output );

		callback();
	}

	return through.obj(processFile, endStream);
};
