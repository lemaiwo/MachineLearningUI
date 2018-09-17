sap.ui.define([
	"sap/ui/base/ManagedObject"
], function (ManagedObect) {
	"use strict";
	return ManagedObect.extend('be.wl.MachineLearning.model.Deployment', {
		metadata: {
			properties: {
				id: 'string',
				name: 'string',
				version: 'string',
				status:'be.wl.MachineLearning.model.Status'
			},
			aggregations: {
			},
			events: {
			},
		}
	});
});