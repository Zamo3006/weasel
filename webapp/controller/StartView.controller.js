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
				KnotenVon: 13
			}, {
				Ladetraeger: "Kiste-22",
				Sfanr: 7322,
				KnotenVon: 13
			}, {
				Ladetraeger: "Kiste-23",
				Sfanr: 7323,
				KnotenVon: 13
			}, {
				Ladetraeger: "Kiste-24",
				Sfanr: 7334,
				KnotenVon: 13
			}, {
				Ladetraeger: "Kiste-25",
				Sfanr: 7325,
				KnotenVon: 13
			}, {
				Ladetraeger: "Kiste-26",
				Sfanr: 7326,
				KnotenVon: 13
			}, {
				Ladetraeger: "Kiste-27",
				Sfanr: 7327,
				KnotenVon: 13
			}, {
				Ladetraeger: "Kiste-28",
				Sfanr: 7328,
				KnotenVon: 13
			}, {
				Ladetraeger: "Kiste-11",
				Sfanr: 7329,
				KnotenVon: 13
			}];
		},

		calculateRouteButtonPressed: function(oEvent) {
			//var position = this.byId("RfidTagInput").getValue();
			//this.getSfas();
			//	this.writeWeaselStatus();
			var position = this.byId("RfidTagInput").getValue();
			this.getView().getModel("test").create(
				"Customer", {
					"Kdnr": position,
					"Ort": "not"
				}, null, {
					success: function() {
						MessageToast.show("wrote stuff", {
							duration: 5000
						});
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

		resetRouteButtonPressed: function(oEvent) {
			//this.getSfas();
			this.setSfas();
			//console.log(sap.ui.getCore().AppContext.Sfas);
			this.getView().getModel("test").read("/Customer", {
				success: function(data) {
					MessageToast.show("read stuff", {
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
					var boxNr = boxx.Ladetraeger.substring(boxx.Ladetraeger.length - 1);
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

		setSfas: function() {
			var aFilters = [new Filter({
				path: "ExternalSystem",
				operator: FilterOperator.EQ,
				value1: this.areal
			})];
			this.getView().getModel("challenge").update("/OffeneSfa",{}, {
				filters: aFilters,
				success: function() {},
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

		//DO SOMETHING!
		routingFunction: function(start) {

			//boxes {nr, station, lvl, loaded}
			var boxes;
			//station {nr, Boxes, #Boxes, Lvl)
			var stations;
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
			var currentBoxes = [];
			//current station
			var currentStation;
			//fetchFinishedvar route;

			//Helper Functions

			function isLevelTwo(station) {
				return station.Level == 2;
			}

			function isLevelOne(station) {
				return station.Level == 1;
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

			//init values
			function init() {
				boxes = sap.ui.getCore().AppContext.boxes;
				stations = sap.ui.getCore().AppContext.stations;

				function even(station) {
					return station.NumberOfBoxes % 2 == 0;
				}
				evenLvlTwos = stations.filter(isLevelTwo).filter(even()).length;
				unevenLvlTwos = 3 - evenLvlTwos;
				updateSorting();
			}

			//decide which boxes to pick
			function pickBoxes() {

			}
			//decide next lvl 1 station
			function findLevelTwo() {
				pickBoxes();
			}

			//decide next lvl 2 station
			function findLevelOne() {
				pickBoxes();
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
			init();
			//loop transport boxes to lvl1 stations
			while (!fetchFinished) {
				updateSorting();
				findLevelTwo();
				findLevelOne();
				updateFinished();
			}
			takeToTarget();
		}
	});

});