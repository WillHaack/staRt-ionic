# staRt-ionic
staRt as a (potentially) cross-platform speech therapy app, powered by Ionic

## Installation

The start-ionic app has two parts: an web plugin that manages everything audio related, and an Ionic app that comprises the interface. The audio plugin must be built separately before it can be loaded into the main app

#### First time setup
Before you can do anything, you need to install and setup a few dependencies. First, you'll need Ionic. Follow the instructions at http://ionicframework.com/getting-started/, which boil down to running

```
npm install -g cordova ionic
```
Next you'll need the TheAmazingAudioEngine submodle, so run

```
git submodule update --init
```
This downloads TheAmazingAudioEngine as a git submodule. Next, download all of the dependencies from npm and bower

```
cd staRt
npm install
bower install
```

Finally, add the iOS platform, which you need to build the audio plugin

```
ionic platform add ios
```

There may be a couple of errors or something, don't sweat it.

#### Building the plugin

```
open audio-plugin/src/ios/AudioPlugin/AudioPlugin.xcodeproj
```
The audio plugin Xcode project has a couple of different targets. You can see all of the different targets by clicking near the top of the window next to the stop button.

![Selecting an Xcode target](readme-images/xcode-targets.png)

- The UniversalLib target is the one to build before running the app. This will build a version of the audio plugin that targets both the simulator as well as iOS itself. You need to build this before running the app for the first time, as well as anytime you change the audio plugin
- The AudioPluginTester target is a very small iOS app that runs the AudioPlugin and draws it using Cocoa. It's a good way to test out new audio processing functionality.

So, to build the plugin, simply select the UniversalLib target and build it.

#### Password Protected Server
The production server is password protected. Therefore, you'll need to create a JSON file `staRt/www/data/credentials.json` with the following format:
```json
{
	"username": "<the_username>",
	"password": "the_password"
}
```
This file is in the `.gitignore` so that the username and password will not be accidentally uploaded to Github. It is important to have this file so when the Ionic application is built, the username and password will be included. To get the username and password, just ask someone.

#### Buliding the ionic app

```
cd staRt
ionic cordova prepare
```
This will load the audio plugin into the app, as well as a few other plugins. You need to run the `ionic state reset` command every time you change and rebuild the plugin.

```
npm install
bower install
```
This downloads and installs all of the project javascript dependencies. You should only need to do this when you first set up the repository, or whenever you install a new package with npm or bower.

```
ionic cordova prepare
```
This builds the plugin. You will need to run this command whenever you change something in the ionic app, as well as whenever you rebuild the plugin. Finally, you can run the app. There are two ways to do this. You can run

```
ionic serve
```
which will open a web browser that serves the app. The nice thing about the web browser is that it has live reload, which means that whenever you change something in the ionic app, the web page will automatically reload to display your changes. The only downside is that it can't display the LPC, since that requires the web plugin which only runs in iOS or in the simulator. If you want to run the app in the simulator or on a device, first open the xcode project:

```
open platforms/ios/staRt.xcodeproj
```
Then choose your target (simulator or iOS) and run

## Example Workflows

#### Changing the audio plugin
- Make some change to the audio plugin
- Rebuild the UniversalLib target
- ```cd staRt```
- ```ionic cordova prepare```
- ```open platforms/ios/staRt.xcodeproj```
- Build and run the app for the simulator or device

#### Changing the ionic container app with live reload
- ```ionic serve```
- Make some change to the container app
- Changes should be reflected immediately

#### Changing the ionic container app in the simulator
- Make some change to the container app
- ```ionic build```
- ```open platforms/ios/staRt.xcodeproj```
- Build and run the app for the simulator or device

#### Linting  
To lint before submitting a PR,  
`$ ./node_modules/.bin/eslint /www/path-to-your-component/*.js`

or, if installed globally: 
`$ eslint ./www/path-to-your-component/*.js`

[eslint rules reference](https://eslint.org/docs/rules/)


## Directory Structure

- audio-plugin
	- src --- Source files for the audio plugin, including the audio processing code
	- www --- Javascript interface for the audio plugin (how the ionic app talks to the native code)
	- plugin.xml --- Configuration file for the plugin
- flask-upload --- Python application that can be used to test file upload
- staRt
	- www --- Main source code of the ionic app. Make all your changes in here
		- css --- Application styles
		- data
			- `staRt_wordlist.csv` --- List of R words for practice
			- `F3r_norms_Lee_et_al_1999.csv` --- List of F3 norms for various ages and genders
		- common-components
			- lpc-directive --- LPC drawing code lives here
			- profile-service --- Saving and loading user profiles
		- states --- All of the application drawing code and logic
			- root
				- free-play
				- profiles
				- resources
				- words
				- tutorial
				- auto
				- syllables   
