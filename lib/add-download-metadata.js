const through = require('through2');
const fileToId = require('./file-to-id');

module.exports = function( options ) {

	const fileTypes = {
		'.frag': 'text',
		'.vert': 'text',
		'.json': 'text',
		'.png': 'image',
		'.jpg': 'image',
		'.multi': 'multi'
	};

	const generateMetaData = function( file ) {
		var id = fileToId( file, options.UrlPrefix ),
			url = id,
			type = fileTypes[file.extname];

		if( type === undefined ) {
			this.emit( 'error', new PluginError('Resource-MetaData', 'Unknown filetype: "' + file.extname + '"') );
		}

		return { Id: id, Url: url, Type: type };
	};

	/**
	 * @this {Transform}
	 */
	var transform = function( file, encoding, callback ) {
		file.Metadata = generateMetaData(file);
		callback( null, file );
	};

	return through.obj( transform );
};
