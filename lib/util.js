const fs = require('fs');
const noop = require('gulp-noop');
const btoa = require('btoa');
const logger = require('fancy-log');
const plumber = require('gulp-plumber');
const path = require('path');
const addMetaData = require('./add-download-metadata');
const collectMetaData = require('./collect-metadata');

module.exports = function(gulp, options) {
	return {

		ifDebug: (func) => {
			if( options.Debug ) {
				return func;
			}
			return noop;
		},
		
		ifRelease: (func) => {
			if( !options.Debug ) {
				return func;
			}
			return noop;
		},

		noop: () => {
			return noop();
		},

		log: (name, callback) => {
			logger( name + ': start');
			return () => {
				logger( name + ': done');
				callback();
			};
		},

		createFileTask: (filepath, data) => {
			return async () => {
				const folder = path.dirname( filepath );
				if( !fs.existsSync( filepath ) ) {
					if( !fs.existsSync( folder ) ) {
						fs.mkdirSync( folder, { recursive: true } );
					}
					fs.writeFileSync( filepath, data );
				}
				await Promise.resolve('done');
			};
		},

		createDownloadTask: (glob, metaDataOptions) => {
			return (callback) => gulp.src( glob, { read: false } )
					.pipe( plumber() )
					.pipe( addMetaData( metaDataOptions ) )
					.pipe( collectMetaData( options.DownloadData ) )
					.on('end', callback);
		},

		encodeMulti: (str) => {
			return btoa( unescape( encodeURIComponent( str ) ) );
		},

		expandGlob: (sources, patterns, opt_extra) => {
			const globs = [];
			patterns.forEach( (pattern) => {
				sources.forEach( (source) => {
					if( pattern.startsWith('!') )
						globs.push( '!' + source + pattern.substring(1) );
					else
						globs.push( source + pattern );
				});
			});
			if( !!opt_extra ) {
				globs.push(...opt_extra);
			}
			return globs;
		}
	}
}
