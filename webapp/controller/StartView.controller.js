sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",

	"sap/m/MessageToast"
], function(Controller, Filter, FilterOperator,
	MessageToast) {
	"use strict";

	return Controller.extend("weasel.challenge.controller.StartView", {

		onPress: function(oEvent) {
			this.getWeaselStatus();
			oEvent.getSource().setText(sap.ui.getCore().AppContext.weaselId);
			
		},
		
		testBoxes: function(){
			
		},
		
		startButtonPressed: function(oEvent)  {
		
		},
		
		stopButtonPressed: function(oEvent){
			
		},
		
		validateStartPosButtonPressed: function(oEvent){
			this.getSfas();
		},
		
		calculateRouteButtonPressed: function(oEvent){
			
		},
		
		resetRouteButtonPressed: function(oEvent){
			
		},
		
		goToRfidTagButtonPressed: function(oEvent){
			
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
			this.weaselId = "AV101";
			sap.ui.getCore().AppContext.weaselId = "AV101";
			this.areal = "WSLC1";
			this.team = 2;
		},

		// get current status of weasel
		getWeaselStatus: function() {
			var aFilters = [new Filter({
				path: "Weaselid",
				operator: FilterOperator.EQ,
				value1:this.weaselId
			})];
			this.getView().getModel("weasel").read("/SSIReadData", {
				filters: aFilters,
				success: function(data) {
					// data.results contains the resulting status
					sap.ui.getCore().AppContext.status = data.results;
					/*
					available fields:
						Weaselid
						Battery
						DriveMode
						GuidelineDetection
						DistanceSensor
						LastRssi
						CurrentError
					*/
				},
				error: function(e) {
					MessageToast.show(e, {
						duration: 5000
					});
				},
				async: true
			}, null, null, true);
		},

		// send weasel to position  = go to rfid tag
		sendWeaselToPosition: function(destination) {
			this.getView().getModel("weasel").update(
				"/SSIUpdatePos(Weaselid='" + this.weaselId + "')", {
					"Weaselid": this.weaselId,
					"Destination": destination
				}, {
					success: function() {
						// weasel is on it's way
						sap.ui.getCore().AppContext.nextPosition = destination;
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

		// get the current information out of the areal
		getRoutes: function() {
			var aFilters = [new Filter({
				path: "Areal",
				operator: FilterOperator.EQ,
				value1: this.areal
			})];
			this.getView().getModel("challenge").read("/Sls2Wege", {
				filters: aFilters,
				success: function(data) {
					// data.results contains all routes in the areal
					sap.ui.getCore().AppContext.routes = data.results;
					/*
					available fields:
						Areal
						KnotenVon
						KnotenNach
						Restp
						Route
						Entfernung
						Gerichtet
						Gesperrt
					*/
				},
				error: function(e) {
					MessageToast.show(e, {
						duration: 5000
					});
				},
				async: true
			}, null, null, true);
		},
		// get the current transport requests
		getSfas: function() {
			var aFilters = [new Filter({
				path: "ExternalSystem",
				operator: FilterOperator.EQ,
				value1: this.areal
			})];
			this.getView().getModel("challenge").read("/OffeneSfa", {
				filters: aFilters,
				success: function(data) {
					/*  Sfanr
						ArealVon
						KnotenVon
						ArealNach
						KnotenNach
					*/
					sap.ui.getCore().AppContext.Sfas = data.results;
				},
				error: function(e) {
					MessageToast.show(e, {
						duration: 5000
					});
				},
				async: true
			}, null, null, true);
		},
		
		// set SFA Status = Stoppen vom fahrauftrag
		setSfaStatus: function(sfa, status) {
			this.getView().getModel("challenge").update(
				"/SfaStatus(Sfanr='" + sfa + "')", {
					"Sfanr": sfa,
					"Status": status
				}, {
					success: function() {
						// status was set
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
					// challenge has started
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
					// challenge has started
				},
				error: function(e) {
					MessageToast.show(e, {
						duration: 5000
					});
				},
				async: true
			}, null, null, true);
		}
	});

});