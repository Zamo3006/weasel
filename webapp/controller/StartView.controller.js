sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ndc/BarcodeScanner",

	"sap/m/MessageToast"
], function(Controller, Filter, FilterOperator, BarcodeScanner,
	MessageToast) {
	"use strict";

	return Controller.extend("weasel.challenge.controller.StartView", {


		startButtonPressed: function(oEvent) {
			this.startChallenge();
		},
		stopButtonPressed: function(oEvent) {
			this.finishChallenge();
		
		testBoxes: function(){
			
		},


		calculateRouteButtonPressed: function(oEvent) {
			var position = this.byId("RfidTagInput").getValue();
			this.getSfaStatus();
			//	this.getWeaselStatus();
		},

		resetRouteButtonPressed: function(oEvent) {

		},

		goToRfidTagButtonPressed: function(oEvent) {
			var position = this.byId("RfidTagInput").getValue();
			if(position > 0 && position < 17){
				this.sendWeaselToPosition(position);
			}else{
				MessageToast.show("Invalid waypoint",{duration : 5000});
			}
		
		validateStartPosButtonPressed: function(oEvent){
			this.getSfas();
		},
		
		
		
		scanButtonPressed: function(oEvent){
			var text = this.byId("BoxText");
			sap.ndc.BarcodeScanner.scan(
				function(mResult) {
					sap.ui.getCore().AppContext.scanResult = mResult.text;
					text.setText("Box: " + sap.ui.getCore().AppContext.scanResult);
				},
				function(Error) {
				 	
				}
			);
		},
		
		setScanText :function(){
			
			this.byId("BoxText").setText( "Box: " + sap.ui.getCore().AppContext.scanResult);
		},
		
		boxButtonPickPressed: function(oControlEvent){

		
		/*	switch() {
				case n:
			        code block
			        break;
			    case n:
			        code block
			        break;
			    default:
			        code block
			}*/
			
		},
		
	findSfa: function(Sfas, team) {
	//create stations
	var stations = new Array([17]);
	stations[16] = ({
		NR: 16,
		NumberOfBoxes: 0,
		Level: 0,
		Boxes: []
	});
	stations[13] = ({
		NR: 13,
		NumberOfBoxes: 0,
		Level: 1,
		Boxes: []
	});
	stations[14] = ({
		NR: 14,
		NumberOfBoxes: 0,
		Level: 1,
		Boxes: []
	});
	stations[11] = ({
		NR: 11,
		NumberOfBoxes: 0,
		Level: 2,
		Boxes: []
	});
	stations[12] = ({
		NR: 12,
		NumberOfBoxes: 0,
		Level: 2,
		Boxes: []
	});
	stations[15] = ({
		NR: 15,
		NumberOfBoxes: 0,
		Level: 2,
		Boxes: []
	});

	var boxes;
	for (var index = 0; index < Sfas.length; ++index) {
		//add
		var boxx = Sfas[index];
		if (boxx.Sfanr.indexOf(team) !== -1) {
			var boxNr = boxx.Ladetraeger.substring(8);
			boxes[boxNr] = {
				Id: boxx.Sfanr,
				Nr: boxNr,
				Station: boxx.KnotenVon,
				loaded: 0
			};
			stations[boxx.KnotenVon].NumberOfBoxes++;
			stations[boxx.KnotenVon].Boxes.push(boxNr);
		}

	}
	sap.ui.getCore().AppContext.boxes = boxes;
	sap.ui.getCore().AppContext.stations = stations;
},

		
		boxButtonPickPressed: function(oEvent){
			
			
			
					
			this.findSfa(sap.ui.getCore().AppContext.Sfas, "Kiste-2");
			
			//var boxId = oEvent.getParameter("id").charAt(oEvent.getParameter("id").length - 1);
			//	Nr: 16,
			//	loaded: 1
			//};
			var station = sap.ui.getCore().AppContext.stations[16];
			
			if (station.NumberOfBoxes > 0) {
				station.NumberOfBoxes--;
			}
			else{
				
			}
			
			
			//sap.ui.getCore().AppContext.stations[]
			
			
		},

		onInit: function() {
			this.weaselId = "AV100";
			sap.ui.getCore().AppContext.weaselId = "AV100";
			this.areal = "WSLC1";
			this.team = 2;
			this.teamBox = "Kiste-2";
		},

		// get current status of weasel
		getWeaselStatus: function() {
			var aFilters = [new Filter({
				path: "Weaselid",
				operator: FilterOperator.EQ,
				value1: this.weaselId
			})];
			this.getView().getModel("weasel").read("/SSIReadData", {
				filters: aFilters,
				success: function(data) {
					sap.ui.getCore().AppContext.status = data.results;
						MessageToast.show("Got Weasel Status",{duration: 5000});
				},
				error: function(e) {
					MessageToast.show(e, {
						duration: 5000
					});
				},
				async: true
			}, null, null, true);
		},
      
		sendWeaselToPosition: function(destination) {
			this.getView().getModel("weasel").read("/SSIUpdatePosRO(Weaselid='" + this.weaselId + "',Destination='" + destination + "')", {
				success: function() {
					sap.ui.getCore().AppContext.nextPosition = destination;
					MessageToast.show("Send Weasel to "+destination,{duration: 5000});
				},
				error: function(e) {
					MessageToast.show(e, {
						duration: 5000
					});
				},
				async: true
			});
		},

		getRoutes: function() {
			var aFilters = [new Filter({
				path: "Areal",
				operator: FilterOperator.EQ,
				value1: this.areal
			})];
			this.getView().getModel("challenge").read("/Sls2Wege", {
				filters: aFilters,
				success: function(data) {
					sap.ui.getCore().AppContext.routes = data.results;
						MessageToast.show("Read Routes",{duration: 5000});
				},
				error: function(e) {
					MessageToast.show(e, {
						duration: 5000
					});
				},
				async: true
			}, null, null, true);
		},
	
		getSfas: function() {
			var aFilters = [new Filter({
				path: "ExternalSystem",
				operator: FilterOperator.EQ,
				value1: this.areal
			})];
			this.getView().getModel("challenge").read("/OffeneSfa", {
				filters: aFilters,
				success: function(data) {
					sap.ui.getCore().AppContext.Sfas = data.results;
						MessageToast.show("Read Sfas",{duration: 5000});
				},
				error: function(e) {
					MessageToast.show(e, {
						duration: 5000
					});
				},
				async: true
			}, null, null, true);
		},
      
		setSfaStatus: function(sfa, status) {
			this.getView().getModel("challenge").update(
				"/SfaStatus(Sfanr='" + sfa + "')", {
					"Sfanr": sfa,
					"Status": status
				}, {
					success: function() {
					},
					error: function(e) {
						MessageToast.show(e, {
							duration: 5000
						});
					},
					async: true
				}
			);
		},
		
		//sfa für box beladen
		pickupSfa: function(sfa) {
			this.setSfaStatus(sfa, "50");
		},
		
		//sfa für entalden von box auf ziel
		setdownSfa: function(sfa) {
			this.setSfaStatus(sfa, "80");
		},

		startChallenge: function() {
			this.getView().getModel("weaselChallenge").read("/Start(Areal='" + this.areal + "')", {
				success: function() {
					MessageToast.show("Started Challenge",{duration: 5000});
				},
				error: function(e) {
					MessageToast.show(e, {
						duration: 5000
					});
				},
				async: true
			}, null, null, true);
		},
		finishChallenge: function() {
			this.getView().getModel("weaselChallenge").read("/Finish(Areal='" + this.areal + "')", {
				success: function() {
					MessageToast.show("Finished Challenge",{duration: 5000});
				},
				error: function(e) {
					MessageToast.show(e, {
						duration: 5000
					});
				},
				async: true
			}, null, null, true);
		},


		//DO SOMETHING!
		routingFunction: function(start) {

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
				if (unevenLvlTwos > 0) {
					sortingPossible = 1;
				} else {
					sortingPossible = 0;
				}
				//TODO
				if (true) {
					sortingNecessary = 1;
				} else {
					sortingNecessary = 0;
				}
			}

			function updateFinished() {
				if ((stations[13].NumberOfBoxes + stations[14].NumberOfBoxes) == 8) {
					fetchFinished = 1;
				}
			}

			//take boxes to target
			function takeToTarget() {

			}

			//routing
			//find first station depending on start position
			if (start == 9) {
				//TODO
			} else if (start == 10) {
				//TODO
			}
			//loop transport boxes to lvl1 stations
			while (!fetchFinished) {
				//TODO sorting stuff
				findLevelTwo();
				findLevelOne();
			}
			takeToTarget();
		}
	});

});