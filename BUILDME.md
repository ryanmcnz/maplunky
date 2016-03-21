# Maplunky Build Instructions

These instructions are for bundling the Maplunky files together with node-webkit, into a portable EXE.

**Pre-requisites:**

 - The latest 32bit version of [NW.js](http://nwjs.io/downloads/) / node-webkit. 
 - [Resource Hacker](http://www.angusj.com/resourcehacker/) (for icon replacement). 
 - [petite](http://www.un4seen.com/petite/), un4seen's EXE compression tool. 
 - [Enigmia Virtual Box](http://enigmaprotector.com/en/aboutvb.html).
 - [The source-code for Maplunky](https://github.com/ryanmcnz/maplunky/releases)

**Build steps:**

 - Replace the icon of nw.exe using Resource Hacker (optional, if you want a custom EXE icon).
 - Compress nw.exe using petite (shrinks it down from about 70MB+ to around 25MB ish).
 - Make sure your Maplunky source-code files are all cleaned up! (eg. no unwanted temporary files in the relative path, such as config files).
 - Copy all of the Maplunky files into the same directory as nw.exe (eg. so that package.json and index.html are in the same folder as nw.exe)
 - Launch Enigma Virtual Box to begin bundling everything together into a single EXE:
  - Point it initially to nw.exe.
  - Ensure "File Options -> Compress Files" is enabled so that the Maplunky files are also compressed.
  - Use the "Add Folder Recursively" option to add all Maplunky files.  
Once this is complete, expand the added files and remove the entry for nw.exe.
  - Click "Process" and pick a location to save your EXE.

That's it! Now Maplunky is a single EXE, all bundled together nicely.  
This seems to be the best method for making a portable node-webkit app, because it doesn't hinder your apps interaction with the OS, especially file and registry IO.
