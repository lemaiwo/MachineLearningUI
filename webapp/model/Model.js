sap.ui.define([
	"sap/ui/base/ManagedObject"
], function (ManagedObect) {
	"use strict";
	return ManagedObect.extend('be.wl.MachineLearning.model.Model', {
		metadata: {
			properties: {
				name: 'string',
				version: 'string'
			},
			aggregations: {
				deployments: {
					type: 'be.wl.MachineLearning.model.Deployment',
					multiple: true
				}
			},
			events: {
			}
		}
	});
});