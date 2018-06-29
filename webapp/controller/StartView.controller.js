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
		pickupSfa: function(sfa) {
			this.setSfaStatus(sfa, "50");
		},
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