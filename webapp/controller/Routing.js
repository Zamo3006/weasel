sap.ui.getCore().AppContext.boxes = [];
sap.ui.getCore().AppContext.stations = [];

//parse boxes by team and number and put them ordered into boxes array; sfas entspricht array mit boxen und deren eigenschaften

sap.ui.getCore().AppContext.routingFunction = function(start) {

	//boxes {nr, station, lvl, loaded}
	var boxes = sap.ui.getCore().AppContext.boxes;
	//station {nr, Boxes, #Boxes, Lvl)
	var stations = sap.ui.getCore().AppContext.stations;
	//need for sorting in LvL1
	var sortingNecessary = 0;
	//sorting possible while fetching
	var sortingPossible = 1;
	//all boxes at lvl 1 stations
	var fetchFinished = 0;
	//# of next box to bring to target
	var nextToTarget = 1;
	//# of lvl2 stations with even # of boxes
	var evenLvlTwos;
	//# of lvl2 stations with uneven # of boxes
	var unevenLvlTwos;
	//currently loaded boxes
	var currentBoxes;
	//current station
	var currentStation;
	//fetchFinishedvar route;

	//Helper Functions
	//decide next lvl 1 station
	function findLevelTwo() {
		
	}

	//decide next lvl 2 station
	function findLevelOne() {

	}

	//decide which boxes to pick
	function pickBoxes() {

	}

	//update sorting necessity
	function updateSorting() {
		if(unevenLvlTwos > 0){
			sortingPossible = 1;
		}else{
			sortingPossible  = 0;
		}
		//TODO
		if(true){
			sortingNecessary = 1;
		}else{
			sortingNecessary = 0;
		}
	}

	function updateFinished(){
		if((stations[13].NumberOfBoxes + stations[14].NumberOfBoxes) == 8){
			fetchFinished = 1;
		}
	}
	
	//take boxes to target
	function takeToTarget() {

	}
	
	//routing
	//find first station depending on start position
	if(start == 9){
		//TODO
	}else if(start == 10){
		//TODO
	}
	//loop transport boxes to lvl1 stations
	while(!fetchFinished){
		//TODO sorting stuff
		findLevelTwo();
		findLevelOne();
	}
	takeToTarget();
};