# Heavy -> Unity Patch downloader

This NodeJS script is for automating the process of downloading a compiled Heavy patch from the [Enzien Audio](http://enzienaudio.com) site, and updating your Unity project with the new version.

### Usage

1. Install dependencies: `npm install`


2. Run the script against your Unity Project folder:

`node patchDownload.js -u [username] -p [patch name] -c [version code] -m [platform(s)] -f [Unity Project folder]`

### Parameters
`-u` Your username on the Enzien Audio site e.g. `owenhindley`

`-p` Patch name on the Enzien Audio site, e.g. `simpleSine`

`-c` Version code, e.g. `OXHV1`

`-m` Comma-separated list of platform(s), e.g. `Android,OSX,Win64` - choose from: `OSX` `Android` `Win32` `Win64`.


`-f` Unity Project folder, e.g. `~/Documents/Projects/MyUnityProject/`

### What happens

The script will create the following folders:

`[Unity Project folder]/Heavy` - all downloaded versions are stored here

`[Unity Project folder]/Assets/Plugins/Heavy/[Platform]` - patch bundles & binaries are stored here by platform.

**Note - when downloading mulitple platforms, the script will remove all but one of the included C# wrapper class files, to prevent conflicts within Unity. This presumes that the wrapper file will be identical per platform.**

### Post-download

You'll probably need to at least re-import your patch, at the most restart Unity. Ideally this work flow will be integrated into an Editor Script :)



Suggestions, complaints to [owenhindley@hotmail.com](mailto:owenhindley@hotmail.com)

