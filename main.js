//DEBUG - Check if we're in node-webkit, otherwise cancel (for dev in Brackets)
//This is especially useful when testing things out in a regular browser
// if(! (typeof process !== "undefined" && process.versions && process.versions["node-webkit"])){
// 	throw new Error("Not using node-webkit, JS halted!");
// }

/////////////////////////////////////////////////////
// IMPORTS AND CONFIG
/////////////////////////////////////////////////////
var fs 					= require("fs");
//Load native UI library
var gui 				= require("nw.gui");
var processExecute 		= require("child_process").exec;
//Load the array observer library
var observePlus 		= require("./observe-plus/observe-plus.js");
//Load the Windows registry library
var winReg 				= require("./registry.js");

var gameOriginalName	= "Spelunky.exe";
var gameBackupName 		= "Spelunky.exe.editor_backup";
var defaultStatusBarTip = "<i>Usage: </i>LMB: Add block,<b></b>RMB: Remove Block";
var mapWidth 			= 20;
var mapHeight 			= 12;
var mapTotalBlockCount 	= mapWidth * mapHeight;
//An initial data offset to use in the game EXE, this is basically not far off from where the maps start.
var initialOffset 		= 1090000;
//Used to clear a map, replacing all blocks in it with zeros ("nothing" tiles)
var mapEmptyData 		= Array(241).join("0");


//Relative path for the app config that points to the game directory
var configLocation 		= ".\\game_dir.cfg";
var gameLocation 		= "";

//Some possible locations to search for the game, if we fail to find it for both GOG and Steam.
//Note: If GOG or Steam is in a custom install location, these won't be relevant.
var possibleGameLocations = [
	 "C:\\Program Files\\Steam\\SteamApps\\common\\Spelunky\\"
	,"C:\\Program Files (x86)\\Steam\\SteamApps\\common\\Spelunky\\"
	,"C:\\GOG Games\\Spelunky\\"
];

//Our main app state. The properties of this object are watched for any changes, allowing the UI to be updated to reflect our state.
var appState = {
	//patchMode can be: ready, disabled, patching, fail, success
	 patchMode: 				"disabled"
	,statusBarTip: 				""
	,statusBarFirstTime:		true
	//Active indexes for map navigation. This object gets watched for any changes, allowing all changed indexes to be accessed in the same function.
	,activeIndexes: {
		 map: 		0
		,mapGroup: 	null
	}
	,statusBarTimeout: 			undefined
	,activeTileBrush: 			""
    ,activeTileFilter:          "All"
	,dragInProgress:			false
	,dragOverlayEntered: 		false
	,mapObserver:				undefined
	,confirmFolderSelection:	false
};

//Used to update one or more active indexes (specified as keys in the parameter).
function updateActiveIndexes(newActiveIndexes){
	appState.activeIndexes = {
		 map: 		(newActiveIndexes.map === undefined ) 		? appState.activeIndexes.map 		: newActiveIndexes.map
		,mapGroup: 	(newActiveIndexes.mapGroup === undefined ) 	? appState.activeIndexes.mapGroup 	: newActiveIndexes.mapGroup
	};
}


/////////////////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////////////////

//This function is used only on app init to ensure that the original game EXE is backed up.
function gameBackupPerform(){
	//Check if the backup exists
	fs.stat(gameLocation + gameBackupName, function(err, stat){
		if(err != null){
			//Perform the backup if the file does not exist
			fs.createReadStream(gameLocation + gameOriginalName).pipe(
				fs.createWriteStream(gameLocation + gameBackupName)
			);
		}
	});
}

//Functions for interacting with the game EXE
function isGameRunning(callbackAfterCheck){
	processExecute("tasklist", function (err, processesRunning){
		var isRunnning = (processesRunning.indexOf(gameOriginalName) > -1);
		callbackAfterCheck(isRunnning);
	});
}
function gameLaunch(){
	//Run the game, but only if it isn't already running!
	isGameRunning(function(isRunning){
		if(isRunning){
			alert("The game is already running!");
		}
		else{
			processExecute(gameOriginalName.replace(/ /g, "\\ "), {
				cwd: gameLocation
			});
		}
	});
}

//Functions for dealing with folder and file navigation
function beginSelectSpelunkyFolder(){
	$("#select_folder_dialog").trigger("click");
}
function spelunkyFolderSelected(){
	var selectedLocation = this.value;
	selectedLocation = tidyPathSlashes(selectedLocation);
	//check if Spelunky files are actually in the specified directory
	if( fileReadableTest(selectedLocation + gameOriginalName) ){
		//Finish initializing the app
		gameLocation = selectedLocation;
		exportGamePathConfig();
		appState.confirmFolderSelection = true;
		init();
	}
	else{
		//Tell the user their selection was invalid
		alert("Woops! That folder doesn't have Spelunky in it. Please try again.\nTip: It should contain a file named '" + gameOriginalName + "'");
	}
}


//Functions for updating the UI to represent the current status of patching the game
function uiPatchClearStatus(){
	$("#save_all_maps").attr("spl-patch-status", false);
	$("#save_all_maps").attr("disabled", false);
}
function uiPatchChangeStatus(patchStatus){
	uiPatchClearStatus();
	//Either disable the patching button or animate it to show the new patching status
	if(patchStatus == "disabled"){
		$("#save_all_maps").attr("disabled", true);
	}
	else{
		$("#save_all_maps").attr("spl-patch-status", patchStatus);
	}
}

//Resets our status bar to the default tip that explains how to use the app
function uiStatusReset(){
	$("#status_bar").html(defaultStatusBarTip);
	//Access a property such as the width, to force a DOM reflow
	$("#status_bar").removeClass("shimmer").width();
	$("#status_bar").addClass("shimmer");
	//Also reset the status of our patch button
	uiPatchClearStatus();
}

//Animates a message temporarily in the status bar, then resets it to the default tip
function uiStatusUpdate(statusMessage){
	$("#status_bar").html(statusMessage);
	//Access a property such as the width, to force a DOM reflow
	$("#status_bar").removeClass("shimmer").width();
	$("#status_bar").addClass("shimmer");
	//Prevent queueing up of status bar timeouts. Instead we just instantly show the next message
	if(appState.statusBarTimeout != undefined){
		clearTimeout(appState.statusBarTimeout);
	}
	if(appState.statusBarFirstTime){
		appState.statusBarFirstTime = false;
	}
	else{
		appState.statusBarTimeout = setTimeout(function(){
			uiStatusReset();
		}, 3000);
	}
}

/////////////////////////////////////////////////////
// MAIN
/////////////////////////////////////////////////////

//Return the next offset in a data buffer that isn't a null value
function skipNullData(dataToSkip, offsetStart, maxSkips){
	offsetStart = offsetStart + 1;
	for(var skip_i = 0; skip_i < maxSkips; skip_i++){
		if(dataToSkip.readUInt8(offsetStart + skip_i) != 0x00){
			//Return the offset of the non-null value
			return offsetStart + skip_i;
		}
	}
	//If skipping null data fails, return our original offset instead
	return offsetStart;
}

//This function is called on app init to get read out map data from the game, as well as the backup of the game EXE
function gameDataRetrieve(){
	var mapOffset = initialOffset;

	var gameData;
	var gameDataBackup;
	try{
		gameData 		= fs.readFileSync(gameLocation + gameOriginalName);
		gameDataBackup	= fs.readFileSync(gameLocation + gameBackupName);
	}
	catch(err){
		//Present an error to the user in both the patch button and status bar, as we weren't even able to read the game file
		appState.statusBarTip = "Error: Failed to read game files. Maybe a file access issue?"; // maybe use err.message somehow?
		return;
	}

	//Loop through map groups
	for(var group_i = 0; group_i < gameMaps.length; group_i++){
		//Get map data offsets for current map group
		var mapSearchResults = searchFileBuffer( gameData, {
			string: "IDS_ARENA_" + gameMaps[group_i].groupNameInternal
			,start: mapOffset
			,limit: 8
		});

		//Loop throuch each map in the group, storing its offset, retrieving its data and checking its MD5
		for(var map_i = 0; map_i < mapSearchResults.found.length; map_i++){
			//Update map offset to reflect search result (including search term length)
			mapOffset = mapSearchResults.found[map_i] + mapSearchResults.query.stringEncodedLength;

			//Jump ahead in the game EXE until we find the actual chunk of map data
			mapOffset = skipNullData(gameData, mapOffset, 100);
			//Store map details
			gameMaps[group_i].maps[map_i].dataAddress = mapOffset;
			//Store current map data, and original backup map data
			gameMaps[group_i].maps[map_i].mapData			= gameData.toString("utf8", mapOffset, mapOffset + mapTotalBlockCount);
			gameMaps[group_i].maps[map_i].defaultMapData	= gameDataBackup.toString("utf8", mapOffset, mapOffset + mapTotalBlockCount);
			
			//Determine whether or not imported map data is default or custom, via comparing MD5 hashes
			recheckMapHash(map_i, group_i);
		}
	}

}

//Determines whether or not map data is default or custom, via comparing MD5 hashes
function recheckMapHash(mapIndex, mapGroupIndex){
	gameMaps[mapGroupIndex].maps[mapIndex].isDefault = ( gameMaps[mapGroupIndex].maps[mapIndex].mapHash == md5(gameMaps[mapGroupIndex].maps[mapIndex].mapData) );
}
function updateMapEntryCustomLabel(mapIndex){
	$("#maps_menu > li").eq(mapIndex).toggleClass("is_changed", ! gameMaps[ appState.activeIndexes.mapGroup ].maps[ mapIndex ].isDefault);
}

function gamePatchMaps(){
	//This shouldn't be possible, but if the patch is already in progress, we don't try to start another one
	if( appState.patchMode == "patching"){
		return;
	}
	//Show in the UI that the patch is in progress
	appState.patchMode = "patching";

	//Retrieve initial game EXE data so we can modify it and then write it back to the file
	var gameData;
	try{
		gameData = fs.readFileSync(gameLocation + gameOriginalName);
	}
	catch(err){
		//Present an error to the user in both the patch button and status bar, as we weren't even able to read the game file
		appState.patchMode = "fail";
		appState.statusBarTip = "Error: Failed to read game files. Maybe a file access issue?"; // maybe use err.message somehow?
		return;
	}

	//Loop through map groups
	for(var group_i = 0; group_i < gameMaps.length; group_i++){
		//Loop through each map in the group, writing its map data to he game EXE
		for(var map_i = 0; map_i < gameMaps[group_i].maps.length; map_i++){
			var currentMap = gameMaps[group_i].maps[map_i];
			gameData.write(currentMap.mapData, currentMap.dataAddress, mapTotalBlockCount, "utf8");
		}
	}

	//Save modified game data to file, but only if the game isn't running!
	isGameRunning(function(isRunning){
		if(isRunning){
			//Show the user the failed patch status on both the button and the status bar
			appState.patchMode = "fail";
			appState.statusBarTip = "Error: Failed to patch the game. Please close it first!";
		}
		else{
			try{
				fs.writeFileSync(gameLocation + gameOriginalName, gameData);
			}
			catch(err){
				//Show the user the failed patch status on both the button and status bar
				appState.patchMode = "fail";
				appState.statusBarTip = "Error: Game patch failed, maybe a file access issue?";
				return;
			}

			//Show the user the successful patch status on both the button and status bar
			appState.patchMode = "success";
			appState.statusBarTip = "Game patched successfully";
		}
	});
}

function populateMapList(mapGroupIndex){
	//replace map list with new one, including name and status of whether maps are custom
	$("#map_groups .val").html(gameMaps[mapGroupIndex].groupName);
	$("#maps_menu").html( $.templates("#tmpl_map_list_entry")(gameMaps[mapGroupIndex].maps) );
}
function populateTilesList(){
	$("#map_tiles_list").html( $.templates("#tmpl_map_tile_list_entry")(gameTiles) );
}
function populateMapTiles(mapIndex, mapGroupIndex){
	//Get map data, with commas between each character
	var newMapTiles = gameMaps[mapGroupIndex].maps[mapIndex].mapData.replace(/(.{1})/g,"$1,").slice(0, -1);
	//Replace any annoying tile chars that would invalidate the HTML with a more usable word
	for(var tile in annoyingTileChars){
		newMapTiles = newMapTiles.replace(new RegExp(tile, "g"), annoyingTileChars[tile]);
	}
	//Append "caps_" to uppercase tile characters
	newMapTiles = newMapTiles.replace(/([A-Z])/g, "caps_$1").toLowerCase();
	//Split on comma and then use jsrender template to generate final HTML for table rows and cols
	newMapTiles = ($.templates("#tmpl_tile_cell")(newMapTiles.split(","))).replace(/(^[ \t]*\n)/gm, "");
	//Finally, replace the new tile cells into the map grid
	$("#map_area table tbody").html(newMapTiles);
}
function populateMapRaw(mapIndex, mapGroupIndex){
	//Clears and repopulates raw map data characters
	$("#map_data_chars").html(gameMaps[mapGroupIndex].maps[mapIndex].mapData);
}
function showMapSelection(mapIndex){
	$("#maps_menu li").removeAttr("selected");
	$("#maps_menu li").eq(mapIndex).attr("selected", true);
}
function showTileBrushSelection(tileBrushID){
	$("#map_tiles_list p").removeAttr("selected");
	$("#map_tiles_list p[bl_"+tileBrushID+"]").attr("selected", true);
	var grid = $("#map_area table");
	grid.attr("brush", tileBrushID);
}

//The main function that handles any index change for both maps and map groups
function activeIndexesChanged(oldIndexes, newIndexes){
	//Map group was changed
	if(newIndexes.mapGroup !== undefined && oldIndexes.mapGroup != newIndexes.mapGroup){
		populateMapList(newIndexes.mapGroup);
		//Display the first map of a group by default
		newIndexes.map = 0;
	}
	//Populate the new map into the UI areas
	showMapSelection(newIndexes.map);
	populateMapTiles(newIndexes.map, newIndexes.mapGroup);
	populateMapRaw(newIndexes.map, newIndexes.mapGroup);
	updateFileExportName(newIndexes.map, newIndexes.mapGroup);
	//Tint the grid tile colors based on the current map group
	applyMapGroupColors(newIndexes.mapGroup);

	return newIndexes;
}

function applyMapGroupColors(groupIndex){
	$("#map_area table").attr("group", gameMaps[groupIndex].groupName.toLowerCase());
}

//Functions for navigation of map group and tile brushes
function showPreviousMapGroup(){
	updateActiveIndexes({
		mapGroup: ((appState.activeIndexes.mapGroup == 0) ? (gameMaps.length - 1) : (appState.activeIndexes.mapGroup - 1))
	});
}
function showNextMapGroup(){
	updateActiveIndexes({
		mapGroup: ((appState.activeIndexes.mapGroup == gameMaps.length - 1) ? 0 : (appState.activeIndexes.mapGroup + 1))
	});
}
function mapListSelectionChanged(ev){
	updateActiveIndexes({
		map: $("#maps_menu li").index(this)
	});
}
function tileListSelectionChanged(ev){
	appState.activeTileBrush = gameTiles[ $("#map_tiles_list p").index(this) ].id;
}

//Functions for map saving and bulk modifying
function exportCurrentMapClicked(){
	$("#export_file_dialog").trigger("click");
}

function updateFileExportName(mapIndex, mapGroupIndex){
	//Set the map export filename to <group>_<index>.splmap
	$("#export_file_dialog").attr("nwsaveas", gameMaps[mapGroupIndex].groupName.toLowerCase().replace(/[^A-Za-z0-9]/g, "") + "_" + (mapIndex + 1) + ".splmap");
}

function exportCurrentMap(){
	//Write file to disk, if user actually finished file selection
	var exportLocation 	= this.value;
	if(exportLocation.length > 0){
		var exportData	= formatMapData( gameMaps[appState.activeIndexes.mapGroup].maps[appState.activeIndexes.map].mapData );

		try{
			fs.writeFileSync(exportLocation, exportData);
		}
		catch(err){
			//Show the user the failed map export in the status bar
			appState.statusBarTip = "Error: Map export failed, maybe a file access issue?";
			return;
		}

		appState.statusBarTip = "Map exported successfully (" + currentMapDesc() + ")";
	}
}
function resetListedMaps(){
	var continueReset = confirm("This will reset the currently listed " + gameMaps[appState.activeIndexes.mapGroup].groupName + " maps to the game defaults. Continue?");
	if(continueReset){
		for(var map_i = 0; map_i < gameMaps[appState.activeIndexes.mapGroup].maps.length; map_i++){
			resetMap(map_i);
		}
	}
	setTimeout(function(){
		$("#maps_menu li").eq(0).trigger("click");
	}, 50);
}
function clearListedMaps(){
	var continueClear = confirm("This will clear the currently listed " + gameMaps[appState.activeIndexes.mapGroup].groupName + " maps to be empty. Continue?");
	if(continueClear){
		for(var map_i = 0; map_i < gameMaps[appState.activeIndexes.mapGroup].maps.length; map_i++){
			clearMap(map_i);
		}
	}
	setTimeout(function(){
		$("#maps_menu li").eq(0).trigger("click");
	}, 50);
}

function resetMap(mapIndex){
	gameMaps[appState.activeIndexes.mapGroup].maps[mapIndex].mapData = gameMaps[appState.activeIndexes.mapGroup].maps[mapIndex].defaultMapData;
	shimmerCurrentMapEntry();
}
function clearMap(mapIndex){
	gameMaps[appState.activeIndexes.mapGroup].maps[mapIndex].mapData = mapEmptyData;
	shimmerCurrentMapEntry();
}

function resetMapClicked(ev){
	resetMap( $("#maps_menu button.reset_map").index(this));
	setTimeout(function(){
		$("#maps_menu li").eq(appState.activeIndexes.map).trigger("click");
	}, 50);
	return false; //Prevent the event from bubbling up as a map list entry
}
function clearMapClicked(ev){
	clearMap( $("#maps_menu button.clear_map").index(this));
	setTimeout(function(){
		$("#maps_menu li").eq(appState.activeIndexes.map).trigger("click");
	}, 50);
	return false; //Prevent the event from bubbling up as a map list entry
}

function initFileDrag(){
	$("body").on("dragover", 	fileDragEnter);
	$("body").on("drop", 		fileDragDrop);
	$("body").on("dragleave", 	fileDragLeave);
}
function fileDragEnter(ev){
	ev.preventDefault();
	//Ignore the titlebar entirely
	if(ev.target.id == "top_bar" || ev.target.id == "close_app"){
		appState.dragOverlayEntered = false;
		appState.dragInProgress = false;
		return;
	}
	//Prevent file drag if the app is loading, or if it has a problem with finding the game, or if it's already occurred on the drag overlay
	if(
		   $("#loading_screen").hasClass("loading")
		|| $("#loading_screen").hasClass("requesting")
		|| (appState.dragInProgress && appState.dragOverlayEntered)
	){
		return false;
	}

	appState.dragInProgress = true;
	if(ev.target.id == "drag_drop_overlay"){
		appState.dragOverlayEntered = true;
	}

	return false; //Prevent page navigation when file is dropped.
}
function fileDragLeave(ev){
	ev.preventDefault();
	//Disregard drag leave events unless events are firing on the actual drag-drop overlay, rather than the DOM behind it
	if( (appState.dragOverlayEntered && ev.target.id == "drag_drop_overlay") || ev.target.id == "close_app" ){
		appState.dragOverlayEntered = false;
		appState.dragInProgress = false;
	}

	return false; //Prevent page navigation when file is dropped.
}
function fileDragDrop(ev){
	ev.preventDefault();
	//Only accept the file drop if its on the designated overlay
	if(appState.dragOverlayEntered){
		var fileData;
		//Only allow a single map to be dropped in
		var fileToRead 			= ev.originalEvent.dataTransfer.files[0];
		//Extract all the juicy file stuff
		var fileName			= fileToRead.path.replace(/^.*[\\\/]/, "");
		var folderPath 			= fileToRead.path.substring(0, fileToRead.path.length - fileName.length - 1);
		var fileData;
		try{
			fileData			= cleanMapData( fs.readFileSync(fileToRead.path).toString("utf8", 0, mapTotalBlockCount + 11) ); //We add 11 onto the block count, to handle new-line characters
		}
		catch(err){
			//Present an error to the user, as we weren't even able to read the map file
			appState.statusBarTip = "Error: Failed to read the map file. Maybe a file access issue?";
			appState.dragInProgress = false;
			appState.dragOverlayEntered = false;
			return false;
		}

		//Validate the file data. If validation fails, the map replacement is canceled and an error is shown.
		if(!mapDataValid(fileData)){
			appState.statusBarTip = "Map replacement failed. Invalid map file detected.";
			appState.dragInProgress = false;
			appState.dragOverlayEntered = false;
			return false;
		}

		//Actually replace the map. This will replace the currently selected map.
		gameMaps[appState.activeIndexes.mapGroup].maps[appState.activeIndexes.map].mapData = fileData;
		//Show the result to the user in the UI
		appState.statusBarTip = "Map replaced successfully (" + currentMapDesc() + ").";
		shimmerCurrentMapEntry();
	}

	appState.dragInProgress = false;
	appState.dragOverlayEntered = false;
	return false;
}

function shimmerCurrentMapEntry(){
	$("#maps_menu li").eq(appState.activeIndexes.map).addClass("replaced");
	setTimeout(function(){
		$("#maps_menu li").removeClass("replaced");
	}, 1000);
}


function toggleDragOverlay(dragInProgress){
	$("#drag_drop_overlay").toggleClass("dragging", dragInProgress);
}

//Checks to ensure that the map data only contains expected characters, and is also the correct length
function mapDataValid(mapData){
	return ( mapData.length == mapTotalBlockCount && !(new RegExp("[^\\" + allowedTileChars.join("|\\") + "]").test(mapData)) );
}

function rawCopyToClipboard(){
	//Write the current map data to the clipboard
	var clipboard = gui.Clipboard.get();
	clipboard.set(formatMapData(gameMaps[appState.activeIndexes.mapGroup].maps[appState.activeIndexes.map].mapData), "text");
}
function rawPasteFromClipboard(){
	//Replace current map data with text on the clipboard
	var clipboard = gui.Clipboard.get();
	var clipboardData = clipboard.get("text");
	clipboardData = cleanMapData(clipboardData);

	if(mapDataValid(clipboardData)){
		gameMaps[appState.activeIndexes.mapGroup].maps[appState.activeIndexes.map].mapData = clipboardData;
		appState.statusBarTip = "Map replaced successfully (" + currentMapDesc() + ").";
		shimmerCurrentMapEntry();
	}
	else{
		appState.statusBarTip = "Error: Clipboard contained invalid map data. Paste failed";
	}
}

function cleanMapData(mapData){
	//Removes any non-usable characters from the provided data, eg. new line formatting.
	var dataFilter = function(val){
		return allowedTileChars.indexOf(val) != -1;
	};
	return mapData.split("").filter(dataFilter).join("");
}
function formatMapData(mapData){
	//Adds new line formatting for each row of 20 characters
	return mapData.replace(/(.{20})/g,"$1\n");
}

function rawMapDataCopied(ev){
	rawCopyToClipboard();
	ev.preventDefault();
}
function rawMapDataPasted(ev){
	rawPasteFromClipboard();
	ev.preventDefault();
}

//Return a description of the currently selected map, eg. "Mines #1"
function currentMapDesc(){
	return gameMaps[appState.activeIndexes.mapGroup].groupName + " #" + (appState.activeIndexes.map + 1);
}

//Observes for changes to the map data array. This is fired off by both user and non-user changes.
function initMapsObserver(){
	appState.mapObserver = observePlus.observe(gameMaps);
	//NOTE: This observer only works if a property is changed to a DIFFERENT value.
	//If a value is updated, but is simply set to the same thing it already was, this event doesn't get fired.
	//While this is inconsistent to simply ignore an observation occuring, it shouldn't impact the apps intended behavior.
	appState.mapObserver.observe("update", mapDataChanged);
}
function mapDataChanged(ev){
	var mapDataPath 	= ev.name.split(".");
	//If the change is not on actual map data (eg. something other than <number>.maps.<number>.mapData), ignore it (eg. changes to "changedViaEditor")
	if(mapDataPath.length != 4 || mapDataPath[3] != "mapData"){
		return;
	}

	var mapGroupIndex 	= mapDataPath[0];
	var mapIndex 		= mapDataPath[2];

	if(mapGroupIndex == appState.activeIndexes.mapGroup){
		recheckMapHash(mapIndex, mapGroupIndex);
		updateMapEntryCustomLabel(mapIndex);

		//Update raw map data input here
		populateMapRaw(mapIndex, mapGroupIndex);

		//Update tiles on map, but only if change was not made via the editor grid
		if(! gameMaps[mapGroupIndex].maps[mapIndex].changedViaEditor){
			populateMapTiles(mapIndex, mapGroupIndex);
		}
		else{
			gameMaps[mapGroupIndex].maps[mapIndex].changedViaEditor = false;
		}
	}
}

//Functions to assist with attribute removal
function removeAllAttributes(el){
	while(el.attributes.length > 0){
		el.removeAttribute(el.attributes[0].name);
	}
}

//Functions for manipulating individual tiles in our grid
function updateGridBlock(tileIndex, tileBrush){
	//Empty attributes on block element
	var tileEl = $("#map_area td").eq(tileIndex);
	removeAllAttributes(tileEl[0]);
	//Make the change in the actual map data
	tileEl.attr("bl_" + tileBrush, true);
	updateMapDataTile(tileIndex, tileBrush);
}
function removeGridBlock(tileIndex){
	//Empty attributes on block element
	var tileEl = $("#map_area td").eq(tileIndex);
	removeAllAttributes(tileEl[0]);
	//Change the block tile to be "nothing"
	tileEl.attr("bl_0", true);
	updateMapDataTile(tileIndex, "0");
}

//Updates a single tile character in the currently active map data
function updateMapDataTile(tileIndex, tileBrush){
	gameMaps[ appState.activeIndexes.mapGroup ].maps[ appState.activeIndexes.map ].changedViaEditor = true;
	var mapData = gameMaps[ appState.activeIndexes.mapGroup ].maps[ appState.activeIndexes.map ].mapData;

	mapData = mapData.replaceCharAt(tileIndex, shortTileBrushName(tileBrush));
	gameMaps[ appState.activeIndexes.mapGroup ].maps[ appState.activeIndexes.map ].mapData = mapData;
}

//Get short, single-character version of a tile brush
function shortTileBrushName(tileBrushLongName){
	return allowedTileChars[ tileBrushIndexes[tileBrushLongName] ];
}

//Handle mouse events for grid tiles (LMB, RMB, drag, etc)
function handleGridTileEvent(ev){
	//Ignore events where the LMB and RMB aren't used, eg. just moving the mouse around
	if(
		(ev.which != 1 && ev.which != 3)
		|| (ev.type == "mousemove" && ignoreMouseMoveBrushes.indexOf(appState.activeTileBrush) != -1)
	){
		return;
	}

	//Handle the possibility of a click incorrectly captured ouside of the block, eg. non 1x1 blocks that render the rest of their graphic using a pseudo element
	var clickOutsideBlock = ( ( ev.offsetX > $(this).width()  || ev.offsetX < 0 ) || ( ev.offsetY > $(this).height() || ev.offsetY < 0 ) );

	var tileIndex = $(this).index();
	var rowIndex = $(this).closest("tr").index();
	tileIndex = (rowIndex * mapWidth) + tileIndex;

	if(ev.which == 1){
		if(clickOutsideBlock){
			//Remove the current non 1x1 block, and re-fire the click event on the grid block behind the pseudo element
			removeGridBlock(tileIndex);
			document.elementFromPoint(ev.clientX, ev.clientY).click();
		}
		else{
			//Add block
			updateGridBlock(tileIndex, appState.activeTileBrush);
		}
	}
	else if(ev.which == 3){
		//Remove block
		removeGridBlock(tileIndex);
	}

	return false;
}

//Ensure that the drag overlay is removed when the window focus is lost
function windowFocusLeave(){
	appState.dragInProgress = false;
	appState.dragOverlayEntered = false;
}

function closeApp(){
	window.close();
}


//Check if a file is readable, by trying to read it!
function fileReadableTest(filePath){
	try{
		var testRead = fs.readFileSync(filePath);
	}
	catch(err){
		return false;
	}
	return true;
}

//Easily read and return a Windows registry value (or undefined if it doesn't exist)
function getRegKeyValue(hiveType, keyPath, keyName, callback){
	var regValue = undefined;
	keyName = keyName.toLowerCase();

	var regKey = winReg({
		 hive: winReg[hiveType]
		,key:  keyPath
	});

	regKey.values(function(err, items){
		if(err == undefined){
			for(var item_i in items){
				if(items[item_i].name.toLowerCase() == keyName){
					callback(items[item_i].value);
					return;
				}
			}
		}

		callback(regValue);
	});

}

//Makes sure a path is a generic Windows path, eg. back-slashes (especially at the end). We do this because some paths in the Registry are poopy.
function tidyPathSlashes(path){
	path = path.replace(/([\\/]+)/g, "\\");
	return path + (path.substr(-1) == "\\" ? "" : "\\");
}

//Saves the currently configured game path into a config file, for retrieval each time the app is opened
function exportGamePathConfig(){
	try{
		fs.writeFileSync(configLocation, gameLocation);
	}
	catch(err){
		// console.log("Failed to save game location to config file: " + err.message);
	}
}

//Populates the brush tile filter buttons, used for toggling visibility of tile brushes by category
function prepareTileBrushFilters(){
	//Populate tile brush filters toolbar
	var filterButtons = $.templates("#tmpl_tile_filter")(gameTileFilters);
	$("#map_tiles_filters").html(filterButtons);
}
function tileBrushFilterChanged(ev){
	//Show button selection visually
	$("#map_tiles_filters button").removeClass("selected");
	$(this).addClass("selected");
	//Apply filter to visibility of tile brushes
	var filter = $(this).html();
	var showAll = (filter == "All");
	if(showAll){
		//Show all tile brushes and select the first brush
		$("#map_tiles_list p").show();
		$("#map_tiles_list p").eq(0).trigger("click");
	}
	else{
		//Show only relevant tile brushes, and select the first one
		$("#map_tiles_list p").each(function(brush_i, brush){
			$(brush).toggle( $(brush).attr("filter-group") == filter );
		});
		$("#map_tiles_list p:visible").eq(0).trigger("click");
	}
}

var windowMinimized = false;
function preventWindowMaximize(){
	var Window = gui.Window.get();
	var windowMinimized = false;
	Window.on("maximize", function(event){
	    Window.unmaximize();
	});
	Window.on("resize", function(event){
	    if(!windowMinimized){
	    	Window.unmaximize();
	    }
	});
	Window.on("minimize", function(event){
	    windowMinimized = true;
	});
	Window.on("restore", function(event){
	    windowMinimized = false;
	});
}

//Checks if any previous game path is configured. If it isn't, check the registry for GOG or Steam paths.
//Once this check is finished, we call the actual init() function for the main app.
function initBegin(){
	//If the game is found, perform remaining init tasks, otherwise ask the user to locate the game files.
	var retrievedConfigPath;
	var configReadSuccess = true;
	var configPathExists = true;

	//Executed if we do actually find the game path without asking the user
	var pathFound = function(path){

		//Path was found, so we don't need to ask the user. Lets initialize the rest of the app!
		gameLocation = path;
		exportGamePathConfig();
		init();
	};
	//Executed when all methods of finding the game have been exhausted, and have failed
	var pathNotFound = function(){
		//Failed to find the game files, so ask the user instead
		$("#loading_screen").addClass("loading").addClass("requesting");
	}

	//Attempt to read the config file and retrieve the game directory
	try{
		retrievedConfigPath = fs.readFileSync(configLocation);
	}
	catch(err){
		configReadSuccess = false;
	}

	if(configReadSuccess){
		retrievedConfigPath = retrievedConfigPath.toString("utf8");
		configPathExists = fileReadableTest(retrievedConfigPath + gameOriginalName);
	}

	if(configReadSuccess && configPathExists){
		//Path was found, so skip checking registry keys or asking the user
		pathFound(retrievedConfigPath);
	}
	else{
		//If the config file was missing, or if the path inside it was missing, refer to the registry instead

		//Retrieve game path from sources other than the config file (registry and directory checks)
		getRegKeyValue("HKLM", "\\SOFTWARE\\GOG.com\\GOGSPELUNKY", "path", function(gogPath){
			function regPathNotFound(){
				//Registry checks failed, so lets try one last thing. Search a few well-known game locations.
				for(var location_i in possibleGameLocations){
					if(fileReadableTest(possibleGameLocations[location_i] + gameOriginalName)){
						pathFound(possibleGameLocations[location_i]);
						return;
					}
				}
				//Game was not found in any well-known locations, so lets ask the user to find it instead
				pathNotFound();
			}
			function regPathFound(path, pathType){
				//Clean up the path found from the registry, and then finish initializing the app with it

				//Adjust our path found in the registry, so that it's all single back-slashes, and has a back-slash at the end
				path = tidyPathSlashes(path);
				//Include Spelunky folder if we're dealing with Steam
				if(pathType == "steam"){
					path = path + "SteamApps\\common\\Spelunky\\";
				}

				//Actually make sure the Spelunky files actually exist at the path we've found
				var pathReadable = fileReadableTest(path + gameOriginalName);
				if(pathReadable){
					pathFound(path);
				}
				else{
					regPathNotFound();
				}
			}

			if(gogPath != undefined){
				//Gog path was found, so lets stop looking any further
				regPathFound(gogPath, "gog");
			}
			else{
				//Gog path was not found, so continue searching. Next up, look for the Steam path
				getRegKeyValue("HKCU", "\\Software\\Valve\\Steam", "steampath", function(steamPath){
					if(steamPath != undefined){
						regPathFound(steamPath, "steam");
					}
					else{
						regPathNotFound();
					}
				});
			}
		});

	}

}

function init(){
	appState.statusBarTip = defaultStatusBarTip;
	//Perform initial backup of the game EXE, to ensure its safe
	gameBackupPerform();
	gameDataRetrieve();
	//Display the first mines maps by default
	updateActiveIndexes({ mapGroup: 0 });
	//Show the list of tiles to use for editing
	populateTilesList();
	//Select the Player 1 spawn brush by default, in our tiles list
	appState.activeTileBrush = "a";
	initFileDrag();

	//Sets up watch events on map data for each map group (so we can sync it with the global state, update UI stuff, etc)
	initMapsObserver();

	appState.patchMode = "ready";
	//Remove loading screen. If the user has recently specified a Spelunky folder, inform them that the selection was successful
	$("#loading_screen").removeClass("requesting").removeClass("loading");
	if(appState.confirmFolderSelection){
		appState.confirmFolderSelection = false;
		appState.statusBarTip = "Spelunky folder configured successfully!";
	}

	//Load brush tile filters, and activate the default active filter.
	prepareTileBrushFilters();
	$("#map_tiles_filters button").eq( gameTileFilters.indexOf(appState.activeTileFilter) ).trigger("click");
}


$(document).ready(function(){
	/////////////////////////////////////////////////////
	// UI EVENTS
	/////////////////////////////////////////////////////

	//Watch for changes to our patching state, so we can show to the user via the UI
	appState.watch("patchMode", function(prop, oldPatchMode, newPatchMode){
		uiPatchChangeStatus(newPatchMode);
		return newPatchMode;
	}, true);
	//Watch for changes to the status bar message, so we can display it in the UI with an animation
	appState.watch("statusBarTip", function(prop, oldStatus, newStatus){
		uiStatusUpdate(newStatus);
		return newStatus;
	}, true);

	//Watch for changes to our map indexes. We check both the map and the map group in one watch.
	appState.watch("activeIndexes", function(prop, oldIndexes, newIndexes){
		return activeIndexesChanged(oldIndexes, newIndexes);
	}, true);

	//Watch for changes to the active tile brush index, updating the tiles list to reflect the new selection
	appState.watch("activeTileBrush", function(prop, oldBrush, newBrush){
		showTileBrushSelection(newBrush);
		return newBrush;
	}, true);
	//Watch for changes to our drag-drop status, so we can show an overlay for dropping the file
	appState.watch("dragInProgress", function(prop, oldDragStatus, newDragStatus){
		toggleDragOverlay(newDragStatus);
		return newDragStatus;
	});

	//Handle mouse events for grid tiles
	$("#map_area").on("click mousemove contextmenu", "td", handleGridTileEvent);

	//Watch for when the window loses focus, so we can hide the drag 'n' drop overlay
	gui.Window.get().on("blur", windowFocusLeave);

	//Watch for when the window is maximized...and un-maximize it.
	//We have to do this due to a bug with node-webkit ignoring "resizable" being set to "false" when double-clicking draggable areas.
	//This is a really old bug!
	preventWindowMaximize();

	//UI click events for buttons, list items, etc
	$("#close_app").click(closeApp);
	$("#select_spelunky_folder").click(beginSelectSpelunkyFolder);

	$("#map_groups .left").click(showPreviousMapGroup);
	$("#map_groups .right").click(showNextMapGroup);
	$("#map_groups .val").click(showNextMapGroup);
	$("#map_groups .val").contextmenu(showPreviousMapGroup);

	$("#maps_menu").on("click", "li", mapListSelectionChanged);
	$("#map_tiles_list").on("click", "p", tileListSelectionChanged);

	$("#maps_menu").on("click", ".reset_map", resetMapClicked);
	$("#maps_menu").on("click", ".clear_map", clearMapClicked);

	$("#export_current_map").click(exportCurrentMapClicked);
	$("#reset_listed_maps").click(resetListedMaps);
	$("#clear_listed_maps").click(clearListedMaps);
	$("#save_all_maps").click(gamePatchMaps);
	$("#launch_game").click(gameLaunch);

	$("#map_data_chars").bind("copy", rawMapDataCopied);
	$("#map_data_chars").bind("paste", rawMapDataPasted);
	$("#raw-copy").click(rawCopyToClipboard);
	$("#raw-paste").click(rawPasteFromClipboard);

	$("#map_tiles_filters").on("click", "button", tileBrushFilterChanged);

	$("#export_file_dialog").change(exportCurrentMap);
	$("#select_folder_dialog").change(spelunkyFolderSelected);

	//Prevent stupid smooth scroll feature that's on middle click by default
	$("body").mousedown(function(ev){
		if(ev.button == 1){
			return false;
		}
	});


	//Debug for reloading the app
	$("#debug_reload").click(function(){
		document.location.reload(true);
	});

	//Actually start the app once the DOM is ready
	initBegin();
});

//Easily replace a single character in a string
String.prototype.replaceCharAt = function(index, character){
    return this.substr(0, index) + character + this.substr(index + 1);
}