sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",

	"sap/m/MessageToast"
], function(Controller, Filter, FilterOperator,
	MessageToast) {
	"use strict";

	var IconTabBarController = Controller.extend("sap.m.sample.IconTabBarProcess.IconTabBar", {
	
	loadButtonColors: function(oEvent){
		
		var key = oEvent.getParameter("key");
		console.log(key);
		if (key == "Beladen"){
			
		}
		else{
			if(key =="Entladen"){
				
			}
		}
	}
	
	});
	
	
	return IconTabBarController;
 
});