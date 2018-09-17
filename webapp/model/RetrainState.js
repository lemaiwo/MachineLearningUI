sap.ui.define([
	"sap/ui/base/ManagedObject",
	"../service/RetrainService",
	"./Deployment",
	"./Status",
	"./Model",
	"./Job",
	"sap/ui/model/base/ManagedObjectModel",
	"sap/ui/core/BusyIndicator"
], function (ManagedObect, RetrainService, Deployment, Status, Model, Job, ManagedObjectModel, BusyIndicator) {
	"use strict";
	return ManagedObect.extend('be.wl.MachineLearning.model.RetrainState', {
		metadata: {
			properties: {
				config: "string",
				newJob:"string",
				isReady: {
					type: 'boolean',
					defaultValue: false
				},
				testKey:"string",
				testResult:"string"
			},
			aggregations: {
				models: {
					type: 'be.wl.MachineLearning.model.Model',
					multiple: true
				},
				jobs: {
					type: 'be.wl.MachineLearning.model.Job',
					multiple: true
				}
			},
			events: {}
		},
		init: function () {},
		getModel: function () {
			if (!this.model) {
				this.model = new ManagedObjectModel(this);
				//this.model.setData(this);
			}
			return this.model;
		},
		setConfig: function (value) {
			BusyIndicator.show(0);
			var me = this;
			this.setProperty("config", value, true);
			// this.model.refresh(true);
			var oConfig = JSON.parse(value);
			this.setProperty("isReady", false);
			if (oConfig && oConfig.clientid && oConfig.clientsecret && oConfig.url) {
				RetrainService.setClientID(oConfig.clientid);
				RetrainService.setClientSecret(oConfig.clientsecret);
				RetrainService.setAuthUrl(oConfig.url);
				RetrainService.setRetrainingURL(oConfig.serviceurls.IMAGE_RETRAIN_API_URL);
				RetrainService.setClassifierURL(oConfig.serviceurls.IMAGE_CLASSIFIER_URL);
				this.setProperty("isReady", true);
				return me.refreshAll();
			}
			return true;
		},
		refreshAll: function () {
			var me = this;
			BusyIndicator.show(0);
			RetrainService.getBearerToken().then(function (token) {
				var tokenInfo = JSON.parse(token);
				return me.refreshRetrainingService(tokenInfo.access_token);
			});
		},
		refreshRetrainingService: function (id) {
			var me = this;
			BusyIndicator.show(0);
			return Promise.all([RetrainService.getDeployments(id), RetrainService.getModels(id),
				RetrainService.getJobs(id)
			]).then(function (response) {
				try {
					var aDeployments = JSON.parse(response[0]);
				} catch (ex) {
					jQuery.sap.log.error(ex);
				}
				try {
					var aModels = JSON.parse(response[1]);
				} catch (ex) {
					jQuery.sap.log.error(ex);
				}
				try {
					me.removeAllJobs();
					var aJobs = JSON.parse(response[2]);
					aJobs.jobs.forEach(function (oJob) {
						me.addJob(new Job({
							id: oJob.id,
							status: oJob.status,
							submissionTime: new Date(oJob.submissionTime),
							startTime: new Date(oJob.startTime),
							finishTime: new Date(oJob.finishTime)
						}));
					});
				} catch (ex) {
					jQuery.sap.log.error(ex);
				}
				if (!aModels) {
					return;
				}
				me.removeAllModels();
				aModels.models.forEach(function (oModel) {
					oModel.versions.forEach(function (oVersion) {
						var oNewModel = new Model({
							name: oVersion.modelName,
							version: oVersion.version
						});
						oNewModel.removeAllDeployments();
						if (aDeployments) {
							aDeployments.deployments.forEach(function (oDeployment) {
								if (oDeployment.modelName === oVersion.modelName && oDeployment.modelVersion === oVersion.version) {
									oNewModel.addDeployment(new Deployment({
										id: oDeployment.id,
										name: oDeployment.modelName,
										version: oDeployment.modelVersion,
										status: new Status({
											state: oDeployment.status.state,
											description: oDeployment.status.description
										})
									}));
								}
							});
						}
						me.addModel(oNewModel);
					});
				});
				BusyIndicator.hide();
				return true;
			});
		},
		undeploy: function (id) {
			var me = this;
			BusyIndicator.show(0);
			RetrainService.getBearerToken().then(function (token) {

				me.tokenInfo = JSON.parse(token);
				return RetrainService.unDeploy(me.tokenInfo.access_token, id);
			}).catch(function (error) {
				jQuery.sap.log.error(error);
			}).then(function () {
				return me.refreshRetrainingService(me.tokenInfo.access_token);
			});
		},
		deploy: function (name, version) {
			var me = this;
			BusyIndicator.show(0);
			return RetrainService.getBearerToken().then(function (token) {
				me.tokenInfo = JSON.parse(token);
				return RetrainService.deploy(me.tokenInfo.access_token, name, version);
			}).catch(function (error) {
				jQuery.sap.log.error(error);
			}).then(function () {
				return me.refreshRetrainingService(me.tokenInfo.access_token);
			});
		},
		deleteJob: function (id) {
			var me = this;
			BusyIndicator.show(0);
			RetrainService.getBearerToken().then(function (token) {
				me.tokenInfo = JSON.parse(token);
				return RetrainService.deleteJob(me.tokenInfo.access_token, id);
			}).catch(function (error) {
				jQuery.sap.log.error(error);
			}).then(function () {
				return me.refreshRetrainingService(me.tokenInfo.access_token);
			});
		},
		startJob: function () {
			var me = this;
			BusyIndicator.show(0);
			try{
				var oJob = JSON.parse(this.getNewJob());
			}catch(error){
				jQuery.sap.log.error(error);
			}
			return RetrainService.getBearerToken().then(function (token) {
				me.tokenInfo = JSON.parse(token);
				return RetrainService.createJob(me.tokenInfo.access_token, oJob);
			}).catch(function (error) {
				jQuery.sap.log.error(error);
			}).then(function (jobid) {
				BusyIndicator.hide();
				return JSON.parse(jobid.response);
			});
		},
		testModel:function(body){
			var me = this;
			BusyIndicator.show(0);
			try{
				var keys = this.getTestKey().split("--");
				var name = keys[0];
				var version = keys[1];
			}catch(error){
				jQuery.sap.log.error(error);
			}
			return RetrainService.getBearerToken().then(function (token) {
				me.tokenInfo = JSON.parse(token);
				return RetrainService.testModel(me.tokenInfo.access_token, name,version,body);
			}).catch(function (error) {
				jQuery.sap.log.error(error);
				return error.responseText ? error.responseText : error;
			}).then(function (response) {
				BusyIndicator.hide();
				me.setProperty("testResult",response);
				return response;
			});
		}
	});
});