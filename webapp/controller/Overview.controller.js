sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/base/ManagedObjectModel",
	"../model/RetrainState",
	"sap/m/MessageBox",
	"../util/ImageHandler"
], function (Controller, ManagedObjectModel, RetrainState, MessageBox, ImageHandler) {
	"use strict";

	return Controller.extend("be.wl.MachineLearning.controller.Overview", {
		onInit: function () {
			this._oRetrainState = new RetrainState();
			this.getView().setModel(this._oRetrainState.getModel());
		},
		unDeploy: function (id) {
			// console.log(oEvent);
			this._oRetrainState.undeploy(id);
		},
		deploy: function (name, version) {
			// console.log(oEvent);
			this._oRetrainState.deploy(name, version);
		},
		refresh: function () {
			this._oRetrainState.refreshAll();
		},
		startJob: function () {
			if (!this._oJobDialog) {
				this._oJobDialog = sap.ui.xmlfragment("be.wl.MachineLearning.view.dialog.CreateJob", this);
				this._oJobDialog.setModel(this.getView().getModel());
			}
			this._oJobDialog.open();
		},
		onClose: function (oEvent) {
			if (this._oJobDialog) {
				this._oJobDialog.close();
			}
		},
		onCreateNewJob: function (oEvent) {
			var me = this;
			this._oRetrainState.startJob().then(function (result) {
				MessageBox.information("Job created with id:" + result.id);
			}).then(me._oRetrainState.refreshAll.bind(me._oRetrainState));
			if (this._oJobDialog) {
				this._oJobDialog.close();
			}
		},
		stopJob: function (id) {
			this._oRetrainState.deleteJob(id);
		},
		addPhoto: function (oEvent) {
			var me = this;
			var file = oEvent.getParameter("files")[0];
			return ImageHandler.resize(file).then(function (image) {
				return me._oRetrainState.testModel({
					files: {
						content: image.blob,
						name: file.name
					}
				});
			});
		}
	});
});