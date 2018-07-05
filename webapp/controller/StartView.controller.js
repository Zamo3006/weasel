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

		testBoxes: function() {
			this.testBoxesArray = [{
				Ladetraeger: "Kiste-21",
				Sfanr: 7321,
				KnotenVon: 11
			}, {
				Ladetraeger: "Kiste-22",
				Sfanr: 7322,
				KnotenVon: 12
			}, {
				Ladetraeger: "Kiste-23",
				Sfanr: 7323,
				KnotenVon: 13
			}, {
				Ladetraeger: "Kiste-24",
				Sfanr: 7334,
				KnotenVon: 14
			}, {
				Ladetraeger: "Kiste-25",
				Sfanr: 7325,
				KnotenVon: 15
			}, {
				Ladetraeger: "Kiste-26",
				Sfanr: 7326,
				KnotenVon: 13
			}, {
				Ladetraeger: "Kiste-27",
				Sfanr: 7327,
				KnotenVon: 11
			}, {
				Ladetraeger: "Kiste-28",
				Sfanr: 7328,
				KnotenVon: 11
			}];
		},

		calculateRouteButtonPressed: function(oEvent) {
			var position = this.byId("RfidTagInput").getValue();
			var test = 1;
			if(position != 10 && position != 9){
				MessageToast.show("Invalid startpoint", {
					duration: 5000
				});
			}else{
				if(!test){
				this.getSfas();
				this.findSfa(sap.ui.getCore().AppContext.Sfas, this.teamBox);
				}else{
					this.testBoxes();
					this.findSfa(this.testBoxesArray, this.teamBox);
				}
				this.routingFunction(position);
			}

		},

		resetRouteButtonPressed: function(oEvent) {
			//this.getSfas();
			console.log(sap.ui.getCore().AppContext.route);
		},

		goToRfidTagButtonPressed: function(oEvent) {
			var position = this.byId("RfidTagInput").getValue();
			if (position > 0 && position < 17) {
				this.sendWeaselToPosition(position);
			} else {
				MessageToast.show("Invalid waypoint", {
					duration: 5000
				});
			}
		},

		scanBoxBeladenPressed: function(oEvent) {

		},

		scanBoxEntladenPressed: function(oEvent) {

		},

		scanButtonPressed: function(oEvent) {
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

		findSfa: function(Sfas, team) {
			//create stations
			var stations = [];
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

			var boxes = [];
			for (var index = 0; index < Sfas.length; ++index) {
				//add
				var boxx = Sfas[index];
				if (boxx.Ladetraeger.indexOf(team) !== -1) {
					var boxNr = parseInt(boxx.Ladetraeger.substring(boxx.Ladetraeger.length - 1));
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

		boxButtonPickPressed: function(oEvent) {

			this.findSfa(sap.ui.getCore().AppContext.Sfas, "Kiste-2");

			//var boxId = oEvent.getParameter("id").charAt(oEvent.getParameter("id").length - 1);
			//	Nr: 16,
			//	loaded: 1
			//};
			var station = sap.ui.getCore().AppContext.stations[16];

			if (station.NumberOfBoxes > 0) {
				station.NumberOfBoxes--;
			} else {

			}

			//sap.ui.getCore().AppContext.stations[]

		},

		onInit: function() {
			this.weaselId = "AV101";
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
					MessageToast.show("Got Weasel Status", {
						duration: 5000
					});
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
					MessageToast.show("Send Weasel to " + destination, {
						duration: 5000
					});
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
					MessageToast.show("Read Routes", {
						duration: 5000
					});
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
					MessageToast.show("Read Sfas", {
						duration: 5000
					});
				},
				error: function(e) {
					MessageToast.show(e, {
						duration: 5000
					});
				},
				async: false
			}, null, null, true);
		},

		setSfaStatus: function(sfa, status) {
			this.getView().getModel("challenge").update(
				"/SfaStatus(Sfanr='" + sfa + "')", {
					"Sfanr": sfa,
					"Status": status
				}, {
					success: function() {},
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
					MessageToast.show("Started Challenge", {
						duration: 5000
					});
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
					MessageToast.show("Finished Challenge", {
						duration: 5000
					});
				},
				error: function(e) {
					MessageToast.show(e, {
						duration: 5000
					});
				},
				async: true
			}, null, null, true);
		},

		//DOES SOMETHING!
		routingFunction: function(start) {

			//station {nr, Boxes, #Boxes, Lvl)
			var stations;
			//Lvl 1 station to collect boxes
			var selectedOne;
			//other lvl 1 statin
			var unselectedOne;
			//need for sorting in LvL1
			var sortingNecessary;
			//sorting possible while fetching
			var sortingPossible = 0;
			//all boxes at lvl 1 stations
			var fetchFinished = 0;
			//lvl 2 stations with even # of Boxes
			var evenLvlTwos = [];
			//lvl2 stations with uneven # of boxes
			var unevenLvlTwos = [];
			//currently loaded boxes
			var currentBoxes = [];
			//current station
			var currentStation;
			//calculated route
			var route = [];

			//Helper Functions
			function removeEmpty(){
				for(var e = evenLvlTwos.length -1 ; e >= 0; --e){
					if(evenLvlTwos[e].Boxes.length == 0){
						evenLvlTwos.splice(e,1);
					}
				}
				for(var u = unevenLvlTwos.length-1; u >= 0; --u){
					if(unevenLvlTwos[u].Boxes.length == 0){
						unevenLvlTwos.splice(u,1);
					}
				}
			}
			//select lvl one station to put boxes add
			function selectLevelOne() {
				if (stations[13].NumberOfBoxes > stations[14].NumberOfBoxes) {
					selectedOne = stations[13];
					unselectedOne = stations[14];
				} else {
					selectedOne = stations[14];
					unselectedOne = stations[13];
				}
			}

			//uneven lvl2 stations
			function findUnevenLevelTwos() {
				if (stations[11].NumberOfBoxes % 2 != 0) {
					unevenLvlTwos.push(stations[11]);
					sortingPossible = 1;
				} else {
					evenLvlTwos.push(stations[11]);
				}
				if (stations[12].NumberOfBoxes % 2 != 0) {
					unevenLvlTwos.push(stations[12]);
					sortingPossible = 1;
				} else {
					evenLvlTwos.push(stations[12]);
				}
				if (stations[15].NumberOfBoxes % 2 != 0) {
					unevenLvlTwos.push(stations[15]);
					sortingPossible = 1;
				} else {
					evenLvlTwos.push(stations[15]);
				}
			}

			//init values
			function init() {
				stations = sap.ui.getCore().AppContext.stations;
				selectLevelOne();
				if (unselectedOne.NumberOfBoxes % 2 == 1) {
					sortingNecessary = 1;
				}
				findUnevenLevelTwos();
				currentStation = start;
			}

			function takeToLevelOne() {
				route.push({
					Typ: "Drive",
					Nr: selectedOne.NR,
					H : "take"
				});
				currentStation = selectedOne;
				var l = currentBoxes.length;
				for (var o = 0; o < l; ++o) {
					var box = currentBoxes.pop();
					route.push({
						Typ: "Unload",
						Nr: box
					});
					selectedOne.Boxes.push(box);
				}
			}

			//decide which boxes to pick
			function pickBoxes() {
				var box;
				if (currentBoxes.length < 2) {
					box = currentStation.Boxes.pop();
					currentBoxes.push(box);
					route.push({
						Typ: "Load",
						Nr: box
					});
					if (currentBoxes.length == 1 && currentStation.Boxes.length > 0) {
						box = currentStation.Boxes.pop();
						currentBoxes.push(box);
						route.push({
							Typ: "Load",
							Nr: box
						});
					}
				}
				removeEmpty();
			}
			
			//startingPoint 10, right
			function startTen() {
				route.push({
					Typ: "Drive",
					Nr: unselectedOne.NR,
					H: "ten1"
				});
				currentStation = unselectedOne;
				pickBoxes();
				if (sortingNecessary && sortingPossible) {
					var next = unevenLvlTwos[0];
					route.push({
						Typ: "Drive",
						Nr: next.NR
						,H: "ten2"
					});
					currentStation = next;
					pickBoxes();
				}
				takeToLevelOne();
			}

			//startingPoint 9, left
			function startNine() {
				if (stations[11].NumberOfBoxes > stations[12].NumberOfBoxes) {
					route.push({
						Typ: "Drive",
						Nr: 11
						,H: "nine1"
					});
					currentStation = stations[11];
				} else {
					route.push({
						Typ: "Drive",
						Nr: 12
						,H:"nine2"
					});
					currentStation = stations[12];
				}
				pickBoxes();
				takeToLevelOne();
				startTen();
			}

			//decide next lvl 1 station
			function findLevelTwo() {
				var next;
				if(evenLvlTwos.length > 0){
					next = evenLvlTwos[0];
				}else if(unevenLvlTwos.length > 0){
					next = unevenLvlTwos[0];
				}
				route.push({Typ: "Drive", Nr: next.NR, H: "findlvl2"});
				currentStation = next;
				pickBoxes();
			}

			function updateFinished() {
				if (selectedOne.Boxes.length == 8) {
					fetchFinished = 1;
				}
			}

			//take boxes to target
			function takeToTarget() {
				if (currentStation != selectedOne) {
					route.push({
						Typ: "Drive",
						Nr: selectedOne.NR
						,H:"target1"
					});
					currentStation = selectedOne;
				}
				for (var o = 1; o < 9; ++o) {
					if (o % 2 == 1) {
						route.push({
							Typ: "Load",
							Nr: o
						});
						route.push({
							Typ: "Load",
							Nr: o + 1
						});
						route.push({
							Typ: "Drive",
							Nr: 16
						});
					} else {
						route.push({
							Typ: "Unload",
							Nr: o - 1
						});
						route.push({
							Typ: "Unload",
							Nr: o
						});
						if (o != 8) {
							route.push({
								Typ: "Drive",
								Nr: selectedOne.NR
							});
						}
					}
				}
			}

			//routing
			init();
			if (currentStation == 9) {
				startNine();
			} else {
				startTen();
			}
			//loop transport boxes to lvl1 stations
			while (!fetchFinished) {
				findLevelTwo();
				takeToLevelOne();
				updateFinished();
			}
			takeToTarget();
			
			sap.ui.getCore().AppContext.route = route; 
		}
	});

});