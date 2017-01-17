# Heavy -> Unity Patch downloader

This NodeJS script is for automating the process of downloading a compiled Heavy patch from the [Enzien Audio](http://enzienaudio.com) site, and updating your Unity project with the new version.

### Usage

1. Install dependencies: `npm install`

2. Ensure that you sucessfully run uploader.py once, so it can save your Enzien access token. You should need to do this only once.

3. Run the script against your PD project & Unity Project folders:

`node patchDownload.js -p [patch name] -s [source PD folder] -m [platform(s)] -f [Unity Project folder]`

### Parameters
`-p` Patch name on the Enzien Audio site, e.g. `simpleSine`. This MUST already exist before you run this script.

`-s` Source PD patch folder, containing at least a _main.pd file.

`-m` Comma-separated list of platform(s), e.g. `Android,OSX,Win64` - choose from: android-armv7a, macos-x64, win-x86, win-x64

`-f` Unity Project folder, e.g. `~/Documents/Projects/MyUnityProject/`

`-l` Launch Unity app after everything's complete (assumes Unity is located in ./Applications/Unity/Unity.app - change on line 186 if your installation/platform is different).

### What happens

The script will create the following folder:

`[Unity Project folder]/Assets/Plugins/Heavy/[Platform]` - patch bundles & binaries are stored here by platform.

**Note - when downloading mulitple platforms, the script will remove all but one of the included C# wrapper class files, to prevent conflicts within Unity. This presumes that the wrapper file will be identical per platform.**

### Post-download

You'll probably need to at least re-import your patch, at the most restart Unity. Ideally this work flow will be integrated into an Editor Script :)



Suggestions, complaints to [owenhindley@hotmail.com](mailto:owenhindley@hotmail.com)

