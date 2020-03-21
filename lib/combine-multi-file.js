const through = require('through2');
const path = require('path');
const btoa = require('btoa');
const fileToId = require('./file-to-id');

module.exports = function(filename, opt) {

	var data = {};
	var output = null;

	function processFile(file, encoding, callback) {

		if( file.isNull() ) {
			callback();
			return;
		}

		if( opt.Filter && !opt.Filter.includes( file.extname ) ) {
			callback( null, file );
			return;
		}

		if( output === null ) {
			output = file.clone( { contents: false } );
			output.path = path.join( file.base, filename );
		}

		const id = fileToId( file, opt.IdPrefix );
		data[ id ] = btoa( unescape( encodeURIComponent( file.contents ) ) );

		callback();
	}


	function endStream(callback) {

		if( output === null ) {
			callback();
			return;
		}

		output.contents = Buffer.from( JSON.stringify( data ) );

		this.push( output );
		callback();
	}

	return through.obj(processFile, endStream);
};
