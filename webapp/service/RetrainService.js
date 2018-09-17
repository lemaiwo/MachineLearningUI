sap.ui.define([
	"./Service"
], function (Service) {
	"use strict";

	var RetrainService = Service.extend("be.wl.MachineLearning.service.RetrainService", {
		constructor: function () {},
		setAuthUrl: function (authURL) {
			this.authURL = authURL;
		},
		setClientID: function (clientid) {
			this.clientid = clientid;
		},
		setClientSecret: function (clientsecret) {
			this.clientsecret = clientsecret;
		},
		setRetrainingURL:function(url){
			url = url.substr(url.indexOf("//")+2);
			this.retrainingUrl = url.substr(url.indexOf("/"));
		},
		setClassifierURL:function(url){
			url = url.substr(url.indexOf("//")+2);
			this.classifierURL = url.substr(url.indexOf("/"));
		},
		getBearerToken: function () {
			var auth = btoa(this.clientid + ":" + this.clientsecret);
			var headers = {
				"authorization": "Basic " + auth,
				"accept": "application/json"
			};
			return this.http(this.authURL + "/oauth/token?grant_type=client_credentials").get(headers);
		},
		getDeployments: function (token) {
			var headers = {
				"authorization": "Bearer " + token,
				"accept": "application/json"
			};
			return this.http(this.retrainingUrl+"/deployments").get(headers).catch(function (error) {
				return error;
			});
		},
		unDeploy: function (token, id) {
			var headers = {
				"authorization": "Bearer " + token,
				"accept": "application/json"
			};
			return this.http(this.retrainingUrl+"/deployments/" + id).delete(headers).catch(function (error) {
				return error;
			});
		},
		deploy: function (token, name, version) {
			var headers = {
				"authorization": "Bearer " + token,
				"accept": "application/json"
			};
			var body = {
				"modelName": name,
				"modelVersion": version
			};
			return this.http(this.retrainingUrl+"/deployments").post(headers,body).catch(function (error) {
				return error;
			});
		},
		getJobs: function (token) {
			var headers = {
				"authorization": "Bearer " + token,
				"accept": "application/json"
			};
			return this.http(this.retrainingUrl+"/jobs").get(headers).catch(function (error) {
				return error;
			});
		},
		createJob: function (token,body) {
			var headers = {
				"authorization": "Bearer " + token,
				"accept": "application/json"
			};
			return this.http(this.retrainingUrl+"/jobs").post(headers,body).catch(function (error) {
				return error;
			});
		},
		deleteJob:function(token,id){
			var headers = {
				"authorization": "Bearer " + token,
				"accept": "application/json"
			};
			return this.http(this.retrainingUrl+"/jobs/" + id).delete(headers).catch(function (error) {
				return error;
			});
		},
		getModels: function (token) {
			var headers = {
				"authorization": "Bearer " + token,
				"accept": "application/json"
			};
			return this.http(this.retrainingUrl+"/models").get(headers).catch(function (error) {
				return error;
			});
		},
		testModel:function(token,name,version,body){
			var headers = {
				"authorization": "Bearer " + token,
				"accept": "application/json"
			};
			return this.http(this.classifierURL+"/models/"+name+"/versions/"+version).post(headers,body);
		}
	});
	return new RetrainService();
});