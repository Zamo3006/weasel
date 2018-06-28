sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/Device"
], function(JSONModel, ODataModel, Device) {
	"use strict";

	return {
		/*
		createScanTextModel: function() {

			var oModel = new JSONModel();
			var data = "BoxDataNotSet";
			oModel.setData(data);
			return oModel;
		},
		*/
		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createWeaselModel: function() {
			var oModel = new ODataModel("/sap/opu/odata/sap/ZSSI_WEASEL_SRV/", {
				json: true,
				loadMetadataAsync: true
			});
			return oModel;
		},
		createChallengeModel: function() {
			var oModel = new ODataModel("/sap/opu/odata/FLEXUS/SBP_TLS4_WEASEL_SRV/", {
				json: true,
				loadMetadataAsync: true
			});
			return oModel;
		},
		createWeaselChallengeModel: function() {
			var oModel = new ODataModel("/sap/opu/odata/sap/ZSSI_WEASEL_CHALLENGE_SRV/", {
				json: true,
				loadMetadataAsync: true
			});
			return oModel;
		}

	};
});