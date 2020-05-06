var otherPlayers = {};

var playerID;
var player;

function loadGame() {
	// load the environment
	loadEnvironment();
	// load the player
	initMainPlayer();

	listenToOtherPlayers();

	window.onunload = function() {
		fbRef.child( "Players/" + playerID ).remove();
	};

	window.onbeforeunload = function() {
		fbRef.child( "Players/" + playerID ).remove();
	};
}

function listenToPlayer( playerData ) {
	if ( playerData.val() ) {
		otherPlayers[playerData.key].setOrientation( playerData.val().orientation.position, playerData.val().orientation.rotation );
	}
}

function listenToOtherPlayers() {
	// when a player is added, do something
	fbRef.child( "Players" ).on( "child_added", function( playerData ) {
		if ( playerData.val() ) {
			if ( playerID != playerData.key && !otherPlayers[playerData.key] ) {
				otherPlayers[playerData.key] = new Player( playerData.key );
				otherPlayers[playerData.key].init();
				fbRef.child( "Players/" + playerData.key ).on( "value", listenToPlayer );
			}
		}
	});

	// when a player is removed, do something

	fbRef.child( "Players" ).on( "child_removed", function( playerData ) {
		if ( playerData.val() ) {
			fbRef.child( "Players/" + playerData.key ).off( "value", listenToPlayer );
			scene.remove( otherPlayers[playerData.key].mesh );
			delete otherPlayers[playerData.key];
		}
	});
}

function initMainPlayer() {

	fbRef.child( "Players/" + playerID ).set({
		isOnline: true,
		orientation: {
			position: {x: 0, y:0, z:0},
			rotation: {x: 0, y:0, z:0}
		}
	});

	player = new Player( playerID );
	player.isMainPlayer = true;
	player.init();
}

function loadEnvironment() {
	// var sphere_geometry = new THREE.SphereGeometry( 1 );
	// var sphere_material = new THREE.MeshNormalMaterial();
	// var sphere = new THREE.Mesh( sphere_geometry, sphere_material );

	// scene.add( sphere );

	var light = new THREE.AmbientLight(); // soft white light
	scene.add( light );

	var mtlLoader = new THREE.MTLLoader();
	mtlLoader.load( 'models/obj.mtl', function( materials ) {

	  materials.preload();

	  var objLoader = new THREE.OBJLoader();
	  objLoader.setMaterials( materials );
	  objLoader.load( 'models/tinker.obj', function ( object ) {

	    object.rotation.x = -Math.PI/2;
		object.translateY(10);
		object.scale.set(0.1,0.1,0.1);
		scene.add( object );

	  } );

	} );


	// var loader = new THREE.OBJLoader();

	// load a resource
	// loader.load(
	// 	// resource URL
	// 	'models/tinker.obj',
	// 	// called when resource is loaded
	// 	function ( object ) {
	// 		object.rotation.x = -Math.PI/2;
	// 		object.translateY(10);
	// 		object.scale.set(0.1,0.1,0.1);
	// 		object.traverse( function ( child ) {
	// 	        if ( child instanceof THREE.Mesh ) {
	// 	            child.material.ambient.setHex(0xFF0000);
 //                    child.material.color.setHex(0x00FF00);
 //                }
	// 	    });
	// 		scene.add( object );

	// 	},
	// 	// called when loading is in progresses
	// 	function ( xhr ) {

	// 		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	// 	},
	// 	// called when loading has errors
	// 	function ( error ) {

	// 		console.log( 'An error happened' );

	// 	}
	// );
}

