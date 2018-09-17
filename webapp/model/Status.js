sap.ui.define([
	"sap/ui/base/ManagedObject"
], function (ManagedObect) {
	"use strict";
	return ManagedObect.extend('be.wl.MachineLearning.model.Status', {
		metadata: {
			properties: {
				state: 'string',
				description: 'string'
			},
			aggregations: {
			},
			events: {
			}
		}
	});
});