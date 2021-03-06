var Jimp = require("jimp");
var File = require('vinyl');
var log = require('fancy-log');

const PLUGIN_NAME = "gulp-jimp-resize";

function goGoGadgetImageResize (file, opt) {
	
	var path = file.path;
	var base;
	var cwd;
	
	var suffix = "";
	
	if(opt.suffix) { var suffix = "-" + opt.suffix; }
	
	var extension = path.substring(path.lastIndexOf('.'));
	var name = path.substring(path.lastIndexOf('\\')+1, path.lastIndexOf('.')) + suffix + extension;
	if(opt.flattenDirectories === false){
		name = path.substring(0, path.lastIndexOf('.')) + suffix + extension;
		base = file.base;
		cwd = file.cwd;
	}
	
	if(!opt.width && !opt.height) { //no resizing to be done
		return new File({
			path: name,
			base: base,
			contents: file.contents
		})
	}
	
	var result = new Promise(function(resolve, reject) {
		Jimp.read(file.contents, function (err, image) {
			if (err) {
				reject(err);
				return;
			}
			
			var width = Jimp.AUTO; var height = Jimp.AUTO;
			
			if((opt.width && opt.width > image.bitmap.width) || 
			(opt.height && opt.height > image.bitmap.height)) {
				if(opt.upscale === false){
					resolve(new File({
						path: name,
						base: base,
						contents: file.contents
					}));
					return;
				}else{
					log(PLUGIN_NAME, 'You are resizing an image to a larger size than the original');
				}
			}
			
			if (opt.width){
				if (/%$/.test(opt.width)) {
					width = image.bitmap.width / 100 * parseFloat(opt.width);
				}
				else {
					width = opt.width;
				}
			}
			
			if (opt.height){
				if (/%$/.test(opt.height)) {
					height = image.bitmap.height / 100 * parseFloat(opt.height);
				}
				else {
					height = opt.height;
				}
			}
			
			image.resize(width, height).quality(100);
			
			var mime;
			switch(file.extname.toLowerCase()){
				case ".jpg":
				case ".jpeg":
				case ".jpe":
				mime = Jimp.MIME_JPEG;
				break;
				case ".png":
				mime = Jimp.MIME_PNG;
				break;
				case ".bmp":
				case ".dib":
				mime = Jimp.MIME_BMP;
				break;
			}
			var newImg = image.getBuffer(mime, function(err, buffer){
				if (err) {
					reject(err);
					return;
				}
				
				resolve(new File({
					path: name,
					base: base,
					contents:buffer
				}));
			});
		});
	})
	
	return result;
};

module.exports = goGoGadgetImageResize