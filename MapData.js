//This file contains the core data structures for working with game maps.
//Map group names (both internal and UI-based), MD5s of the original maps (for determining which are "custom"), map tile characters, etc.
//It will also host any of the juicy useful stuff we parse out of the game.

var gameMaps = [
	{
	 	 groupNameInternal: "MINES"
	 	,groupName: 		"Mines"
	 	,maps: [
	 		 { mapHash: "f3677729d36d9ee7445d0baf7359f5ab", mapName: "Miner Threat",	isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "10e1f6e5687d57c2f054114068a41c40", mapName: "Layer Cake",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "9f398bad1624937de5f407abee16d628", mapName: "Rock n' Roll",	isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "bd1605f46f193c1348dcaf3a8c06a5dd", mapName: "Crates",			isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "47e6cfff4f443acfb591486cac3230c7", mapName: "The Dome",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "7f9235a521aee477ee702aa0448ea87d", mapName: "Falling Rocks",	isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "6b3cf44477bca399f52fffbeb7fbec51", mapName: "The Spider Pit",	isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "57dec9db8336ba3d9c3081eb1f9066bf", mapName: "Ladders",			isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 	]
	}
	,{
	 	 groupNameInternal: "LUSH"
	 	,groupName: 		"Jungle"
	 	,maps: [
	 		 { mapHash: "9d365f6bfda9ae7e6450d41ae596ea44", mapName: "Tiki Terror",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "06399a21ac0f2c7627cbe492dcef5be5", mapName: "Treehouses",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "851cbae89c24c2002753b8cbdd521e2a", mapName: "Vines",			isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "59a295a197428324afbe81df566d99e6", mapName: "Fortress",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "e40f485a3816a1696b8593379cb9e523", mapName: "Dunk Tank",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "f9285d1195b86e4b58d0993f25cce28a", mapName: "Tarzan",			isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "f3157e6b41fb6bba9607f98bf216b0d4", mapName: "Kudzu",			isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "5fe053376eb1bab927454ffd3c80b5c6", mapName: "The Hill",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 	]
	}
	,{
	 	 groupNameInternal: "ICE"
	 	,groupName: 		"Ice"
	 	,maps: [
	 		 { mapHash: "a49eedc714274643f5905302302be3c7", mapName: "Ice Temple",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "2ce672615b4ca5558046b62f3fd7cd07", mapName: "Moonbounce",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "90e5138853bf099280db09f6ca8ab7b7", mapName: "Don't Fall!",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "fbef2b70daa0ff849f4bbd4bd6464e67", mapName: "The Calm",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "6b39f829deb4d89ff5a7014d6372bb23", mapName: "Deathbounce",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "a4a66725d17be937bf7721a74f10ff57", mapName: "Frosted",			isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "bba59152ae649c4ba71515a447f20c2c", mapName: "Cold Cage",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "d4cb6ad097414dd92a7fe76806d752e0", mapName: "Do Fall!",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 	]
	}
	,{
	 	 groupNameInternal: "TEMPLE"
	 	,groupName: 		"Temple"
	 	,maps: [
	 		 { mapHash: "a04de5836561aeba1bf95ac7a8a88749", mapName: "Trap Temple",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "9e051b68d56cbcccb072f6a0f47b8a02", mapName: "Fire Pit",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "f229b714000c5d53daf1a036f98ab03a", mapName: "Rooms",			isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "c13cca15e3f7ed8e4ded5f8ada085a92", mapName: "Deathbox",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "cf0e88aee74ba74667498366b98512fa", mapName: "Pressure",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "5ce2ba8d28c6089f4c9949778da386c9", mapName: "Crushers",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "98a6bae6770cf4c8bd3dc8423b5deb25", mapName: "Pachinko",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "7e184491214b66bc8187e08f2d7a2330", mapName: "Fire Walk",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 	]
	}
	,{
	 	 groupNameInternal: "HELL"
	 	,groupName: 		"Hell"
	 	,maps: [
	 		 { mapHash: "f57b03e5af5c4c09035754c8bbf9968c", mapName: "The Grinder",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "aabcd4802c5d7d4d3d543bb5dcbdbf8d", mapName: "Tension",			isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "12468e9e4ef5a56b688ab012c4c0f43c", mapName: "Diabolika",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "2270e39c040ebe3009a63091fbcdf3e2", mapName: "The Ziggurat",	isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "1e32f99894caa26b159a209be06f84dd", mapName: "Tree of Death",	isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "92e831e81d2b76203c46c56432e56109", mapName: "The Wall",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "def590caa720972da9519ce202bb2c56", mapName: "Flesh Field",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "3e9c887f2d382ce72045b247efd4283c", mapName: "No Refuge",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 	]
	}
	,{
	 	 groupNameInternal: "SPECIAL"
	 	,groupName: 		"Special"
	 	,maps: [
	 		 { mapHash: "e2800f0103eb5d700299cc39c4b96702", mapName: "Acid Bath",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "52ace9e044c2f43fdf76061246103868", mapName: "The Womb",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "801c3ae92f732b4379d4db5eb9762758", mapName: "Scar Tissue",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "09edfbb4a8e42ad15aff7713c05dbdbf", mapName: "Intestines",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "8ecb329af3ea13206e67b729717e08ca", mapName: "Zapped",			isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "abf1d2c5b28c39b8893ca9a6fc1e694a", mapName: "Cells",			isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "5e48b0fee91f7d3d7fdb79a1104f3058", mapName: "Moonbounce II",	isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 		,{ mapHash: "8a6fc6f31590e1dd61929ec4f92e1ff5", mapName: "Elevators",		isDefault: true, mapData: null, defaultMapData: null, dataAddress: null, changedViaEditor: null }
	 	]
	}
];

var gameTileFilters = ["All", "Terrain", "Moving", "Spawns", "Monsters", "Traps"];

//TODO investigate any other characters not listed below (eg. A-Z, 0-9, other symbols, etc). See if there are any others we can add in, that are perhaps only in singleplayer.
var gameTiles = [
	 {id: "a", 				name:"P1 Spawn", 				filterGroup: "Spawns" }
	,{id: "b", 				name:"P2 Spawn", 				filterGroup: "Spawns" }
	,{id: "c", 				name:"P3 Spawn", 				filterGroup: "Spawns" }
	,{id: "d", 				name:"P4 Spawn", 				filterGroup: "Spawns" }
	,{id: "0", 				name:"Nothing", 				filterGroup: "Terrain" }
	,{id: "caps_b", 		name:"Unbreakable", 			filterGroup: "Terrain" }
	,{id: "1", 				name:"Dirt", 					filterGroup: "Terrain" }
	,{id: "2", 				name:"Random Dirt / Air", 		filterGroup: "Terrain" }
	,{id: "h", 				name:"Honeycomb",				filterGroup: "Terrain" }

	,{id: "r", 				name:"Random Dirt / Brick",		filterGroup: "Terrain" }
	,{id: "caps_r",			name:"Temple / Castle Brick",	filterGroup: "Terrain" }

	,{id: "l", 				name:"Ladder", 					filterGroup: "Terrain" }
	,{id: "caps_l", 		name:"Climbable (Themed)",		filterGroup: "Terrain" }
	,{id: "p", 				name:"Ladder Ledge", 			filterGroup: "Terrain" }
	,{id: "s", 				name:"Spikes", 					filterGroup: "Traps" }
	,{id: "caps_c", 		name:"Crate", 					filterGroup: "Spawns" }
	,{id: "v", 				name:"Underwater Crate", 		filterGroup: "Spawns" }

	,{id: "o", 				name:"Rock", 					filterGroup: "Spawns" }
	,{id: "caps_o",			name:"Boulder",					filterGroup: "Terrain" }

	,{id: "i", 				name:"Ice", 					filterGroup: "Terrain" }
	,{id: "j", 				name:"Random Ice / Air", 		filterGroup: "Terrain" }
	,{id: "underscore", 	name:"Ice Ledge", 				filterGroup: "Terrain" }

	,{id: "f", 				name:"Falling Platform",		filterGroup: "Terrain" }

	,{id: "w", 				name:"Water", 					filterGroup: "Terrain" }
	,{id: "hash", 			name:"Pushable Block", 			filterGroup: "Moving" }
	,{id: "caps_x", 		name:"Unmovable Block", 		filterGroup: "Terrain" }
	,{id: "x", 				name:"Sacrifice Altar", 		filterGroup: "Monsters" }
	,{id: "caps_t", 		name:"Tree", 					filterGroup: "Terrain" }
	,{id: "caps_m", 		name:"Up/Down Elevator", 		filterGroup: "Moving" }
	,{id: "caps_s", 		name:"Jump Pad", 				filterGroup: "Moving" }
	,{id: "caps_p", 		name:"TNT",						filterGroup: "Traps" }
	,{id: "caps_j", 		name:"Jetpack", 				filterGroup: "Spawns" }
	,{id: "k", 				name:"Mattock", 				filterGroup: "Spawns" }
	,{id: "caps_d", 		name:"Passive Totem Head", 		filterGroup: "Terrain" }
	,{id: "g", 				name:"Gold Idol",		 		filterGroup: "Terrain" }

	,{id: "caps_i",			name:"Totem", 					filterGroup: "Terrain" }

	,{id: "t", 				name:"Dirt / Tiki Trap / Air",	filterGroup: "Traps" }
	,{id: "caps_h", 		name:"Thwomp (Smasher)",		filterGroup: "Moving" }
	,{id: "caps_k", 		name:"Spike Ball Anchor",	 	filterGroup: "Moving" }
	,{id: "z", 				name:"Turret", 					filterGroup: "Traps" }
	,{id: "caps_z", 		name:"Zapper", 					filterGroup: "Traps" }
	,{id: "caps_g", 		name:"Big Spider", 				filterGroup: "Monsters" }
	,{id: "caps_q", 		name:"Alien Queen",				filterGroup: "Monsters" }
	,{id: "m", 				name:"Mammoth", 				filterGroup: "Monsters" }

	,{id: "caps_e",			name:"Flesh", 					filterGroup: "Terrain" }

	,{id: "greater_than", 	name:"Blob Floor", 				filterGroup: "Monsters" }
	,{id: "less_than", 		name:"Blob Ceiling", 			filterGroup: "Monsters" }
];

var allowedTileChars = [
	"a","b","c","d","0","B","1","2","h","r","R","l","L","p","s","C","v","o","O","i","j","_","f","w","#","X","x","T","M","S","P","J","k","D","g","I","t","H","K","z","Z","G","Q","m","E",">","<"
];

var annoyingTileChars = {
	 ">": "greater_than"
	,"<": "less_than"
	,"#": "hash"
	,"_": "underscore"
};

//Non 1x1 blocks that should only be placed by clicking, not dragging
var ignoreMouseMoveBrushes = ["caps_o", "x", "caps_t", "caps_i", "t", "caps_g", "caps_q", "m"];

var tileBrushIndexes = {
	 "a":				0
	,"b": 				1
	,"c": 				2
	,"d": 				3
	,"0": 				4
	,"caps_b": 			5
	,"1": 				6
	,"2": 				7
	,"h": 				8
	,"r": 				9
	,"caps_r": 			10
	,"l":				11
	,"caps_l": 			12
	,"p": 				13
	,"s": 				14
	,"caps_c": 			15
	,"v": 				16
	,"o":				17
	,"caps_o": 			18
	,"i": 				19
	,"j":				20
	,"underscore": 		21
	,"f": 				22
	,"w": 				23
	,"hash": 			24
	,"caps_x": 			25
	,"x": 				26
	,"caps_t": 			27
	,"caps_m": 			28
	,"caps_s": 			29
	,"caps_p": 			30
	,"caps_j": 			31
	,"k": 				32
	,"caps_d": 			33
	,"g": 				34
	,"caps_i": 			35
	,"t": 				36
	,"caps_h": 			37
	,"caps_k": 			38
	,"z": 				39
	,"caps_z": 			40
	,"caps_g": 			41
	,"caps_q": 			42
	,"m":				43
	,"caps_e":			44
	,"greater_than":	45
	,"less_than":		46
};