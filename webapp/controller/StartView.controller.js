sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",

	"sap/m/MessageToast"
], function(Controller, Filter, FilterOperator,
	MessageToast) {
	"use strict";

	var areal;

	return Controller.extend("weasel.challenge.controller.StartView", {

		onPress: function(oEvent) {
			this.getWeaselStatus();
			oEvent.getSource().setText(sap.ui.getCore().AppContext.weaselId);
		
		},
		
		startButtonPressed: function()  {
			areal = this.byId("inputField").getValue();
			if(areal ==="" || areal === null){
				MessageToast.show("Error", {
							duration: 5000
						});
		/*	}else if(areal === "Hallo"){
							MessageToast.show("Hallo!", {
							duration: 5000
						});*/
			}else{
				MessageToast.show("hat geklappt", {
							duration: 5000
						});
				//this.startChallenge(areal);
						
			}
	/*		if (areal !== "" || areal !== null){
				
				this.startChallenge(areal);
			}else{
				MessageToast.show("Error", {
							duration: 5000
						});
			}*/
			//this.byId("button").setVisible(false);
		},
		
			stopButtonPressed: function(){
			
		},
		
		validateStartPosButtonPressed: function(){
			
		},
		
		calculateRouteButtonPressed: function(){
			
		},
		
		resetRouteButtonPressed: function(){
			
		},
		
		goToRfidTagButtonPressed: function(){
			
		},

		onInit: function() {
			this.weaselId = "AV101";
			sap.ui.getCore().AppContext.weaselId = "AV101";
			this.areal = "wslc1";
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

		// send weasel to position
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
		
		// set SFA Status
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
		pickupSfa: function(sfa) {
			this.setSfaStatus(sfa, "50");
		},
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