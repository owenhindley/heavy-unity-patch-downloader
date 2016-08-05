var program = require("commander");
var wget = require("wget-improved");
var fs = require("fs");
var exec = require("child_process").exec;
var path = require("path");
var findit = require("findit");

/*
	Patch downloader for Heavy -> Unity
*/


console.log("* * * * * * * * * * * * * * * * * * * ")
console.log("   Heavy -> Unity Patch downloader")
console.log("");
console.log("* * * * * * * * * * * * * * * * * * * ")

console.log(__dirname);

var ENZIEN_ROOT = "https://enzienaudio.com/h/";

var platforms = {
	"Android" : {
		"path" : "unity/android/armv7s"
	},
	"OSX" : {
		"path" : "unity/osx/x86_64"
	},
	"Win32" : {
		"path" : "unity/win/i386"
	},
	"Win64" : {
		"path" : "unity/win/x86_64"
	}
}

function list(val){
	return val.split(',');
}

program
	.version('1.0.0')
	.option('-u, --user [value]', 'User name on Heavy Website')
	.option('-p, --patch [value]', "Patch name on Heavy Website")
	.option('-c, --code [value]', "Version code on Heavy Website")
	.option('-f, --folder [value]', "Unity Project Folder")
	.option('-m, --platform <items>', "Which platforms to download - comma-separated list of Android, OSX, Win32, Win64", list)
	.parse(process.argv);

function errorAndQuit(msg) {
	console.error("Error :");
	console.error(msg);
	process.exit(1);
}

function ensureFolder(folder) {
	console.log("ensuring folder : " + folder);
	if (!fs.existsSync(folder)){
		fs.mkdirSync(folder);
	}
}

function escapePath(path) {
	return path.replace(/ /g, '\\ ');
}

if (!program.user) errorAndQuit("No username found");
if (!program.patch) errorAndQuit("No patch name found");
if (!program.code) errorAndQuit("No patch code found");
if (!program.folder) errorAndQuit("No project folder found");
if (!program.platform) errorAndQuit("No platform found");

if (typeof(program.platform) == "object"){
	for (var idx in program.platform){
		var platform = program.platform[idx];
		if (!platforms.hasOwnProperty(platform)) errorAndQuit("Platform '" + platform + "' not recognised - choose from Android, OSX, Win32, Win64.");	
	}
}



console.log("Downloading...");

function nextPlatform() {
	if (program.platform.length > 0) {
		var platform = program.platform.pop();
		var platformPath = platforms[platform].path;
		var src = ENZIEN_ROOT;
		src += program.user + "/"
		src += program.patch + "/"
		src += program.code + "/"
		src += platformPath + "/archive.zip";
		console.log("** Downloading for platform " + platform + " **");
		console.log(" from " + src);

		var tempFolder = program.folder + "/Heavy";
		ensureFolder(tempFolder);
		console.log(" to temp folder : " + tempFolder);
		var filename = program.patch + "." + program.code + "." + platformPath.replace(/\//g, ".") + ".zip"
		console.log(" with filename : " + filename);
		console.log('....');
		
		var download = wget.download(src, tempFolder + "/" + filename, {});
		download.on('error', function(err){
			console.error(err);
		});
		download.on('start', function(filesize){
			console.log("size : " + filesize);
		});
		download.on('end', function(output){
			console.log("complete : " + output);

			// unzip the file to the correct folder
			var platformPluginFolder = program.folder + "/Assets/Plugins/Heavy/" + platform;
			ensureFolder(platformPluginFolder);
			console.log("unzipping to " + platformPluginFolder);
			var cmd = "unzip -o " + escapePath(tempFolder) + "/" + filename + " -d " + escapePath(platformPluginFolder);
			exec(cmd, function(error, stdout, stderr){
				console.log(error);
				console.log(stdout);

				// extractWrapperClass();
				nextPlatform();
			});
		});

	} else {
		console.log("Complete!");
		extractWrapperClass();
	}
}

function extractWrapperClass() {

	var pluginFolder = program.folder + "/Assets/Plugins/Heavy";
	var finder = findit(pluginFolder);

	var wrapperList = [];
	var wrapperFileName = "Hv_" + program.patch + "_LibWrapper.cs";

	console.log("**************");
	console.log("Finding wrapper classes...");

	var existingWrapper = pluginFolder + "/" + wrapperFileName;

	finder.on('file', function(file, stat){
		if ((file.indexOf(wrapperFileName) != -1) && (file.indexOf(".meta") == -1) && file !== existingWrapper){
			console.log("found wrapper class at " + file);
			wrapperList.push(file);
		}
	});

	finder.on('end', function() {

		if (wrapperList.length > 0){
			var chosenWrapper = wrapperList.pop();
			console.log("USING " + chosenWrapper + " AS WRAPPER, IF THERE ARE PROBLEMS CHECK HERE.");
			var cmd = "mv " + escapePath(chosenWrapper) + " " + escapePath(pluginFolder) + "/" + path.basename(chosenWrapper);
			exec(cmd, function(error, stdout, stderr){
				console.log(error);
				console.log(stdout);

				console.log("let's presume the earlier move went okay.. let's delete the others");

				while(wrapperList.length){
					var chosenWrapper = wrapperList.pop();
					console.log("deletng " + chosenWrapper);
					var cmd = "rm " + escapePath(chosenWrapper);
					exec(cmd, function(error, stdout, stderr){
						console.log(error);
						console.log(stdout);
					});
				}

				console.log("Done!");

			});

		} else {
			console.error("ERROR : WRAPPER C# CLASS NOT FOUND.. something went wrong here.");
		}



	});

	

	

}

// extractWrapperClass();

nextPlatform();






