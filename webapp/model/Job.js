sap.ui.define([
	"sap/ui/base/ManagedObject"
], function (ManagedObect) {
	"use strict";
	return ManagedObect.extend('be.wl.MachineLearning.model.Job', {
		metadata: {
			properties: {
				id: 'string',
				status: 'string',
				submissionTime: 'object',
				startTime: 'object',
				finishTime: 'object'
			},
			aggregations: {
			},
			events: {
			}
		}
	});
});