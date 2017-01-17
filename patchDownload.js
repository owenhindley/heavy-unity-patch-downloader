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
	"android-armv7a" : {
		"path" : "unity/android/armv7a"
	},
	"macos-x64" : {
		"path" : "unity/osx/x86_64"
	},
	"src" : {
		"path" : "unity/src"
	},
	"win-x86" : {
		"path" : "unity/win/i386"
	},
	"win-x64" : {
		"path" : "unity/win/x86_64"
	}
}

function list(val){
	return val.split(',');
}

program
	.version('1.0.0')
	.option('-p, --patch [value]', "Patch name on Heavy Website")
	.option('-s, --source [value]', "Source folder on local machine")
	.option('-f, --folder [value]', "Unity Project Folder")
	.option('-m, --platform <items>', "Which platforms to download - comma-separated list of the following (no spaces) : android-armv7a, macos-x64, win-x86, win-x64, src", list)
	.option('-l, --launch')
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

if (!program.patch) errorAndQuit("No patch name found");
if (!program.source) errorAndQuit("No patch source folder found");
if (!program.folder) errorAndQuit("No project folder found");
if (!program.platform) errorAndQuit("No platform found");

if (typeof(program.platform) == "object"){
	for (var idx in program.platform){
		var platform = program.platform[idx];
		if (!platforms.hasOwnProperty(platform)) errorAndQuit("Platform '" + platform + "' not recognised - choose from Android, OSX, Win32, Win64, src.");
		program.platform[idx] = "unity-" + program.platform[idx];
	}
}

console.log("Uploading...");

var TEMP_FOLDER = program.folder + "/Heavy";


var cmd = "python uploader.py ";
cmd += program.source;
cmd += " --out " + TEMP_FOLDER;
cmd += " --name " + program.patch;
cmd += " --gen " + program.platform.join(" ");
cmd += " -b";

console.log("running uploader : ");
console.log(cmd);

exec(cmd, function(error, stdout, stderr){
	if (error){
		console.log(" exec error ");
		console.log(error);
		return;
	}
	console.log(stdout);
	console.log(stderr);

	console.log("Downloading...");
	nextPlatform();

});




function nextPlatform() {
	if (program.platform.length > 0) {
		var platform = program.platform.pop();
		var platformPath = platforms[platform.replace("unity-", "")].path;

		// unzip the file to the correct folder
		var platformPluginFolder = program.folder + "/Assets/Plugins/Heavy/";

		// Android is a special case, it goes in an additional 'armeabi-v7a' folder for some reason
		

		ensureFolder(platformPluginFolder);
		
		var cmd = "mv " + escapePath(TEMP_FOLDER + "/" + platform) + " " + platformPluginFolder + "/" + platform;

		if (platform == "Android")
			cmd += "/armeabi-v7a";

		// console.log(cmd);
		exec(cmd, function(error, stdout, stderr){
			console.log(error);
			console.log(stdout);
			// extractWrapperClass();
			nextPlatform();
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
	var wrapperFileName = "Hv_" + program.patch + "_AudioLib.cs";

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

				if (program.launch){

					console.log("launching Unity");
					var cmd = "open /Applications/Unity/Unity.app";
					exec(cmd, function(error, stdout, stderr){
						console.log(error);
						console.log(stdout);
					});

				} else {

					console.log("Done!");
				}



			});

		} else {
			console.error("ERROR : WRAPPER C# CLASS NOT FOUND.. something went wrong here.");
		}



	});





}

// extractWrapperClass();

// nextPlatform();






