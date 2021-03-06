/**
 * conbo.Event
 * 
 * Default event class for events fired by Conbo.js
 * 
 * For consistency, callback parameters of Backbone.js derived classes 
 * are event object properties in Conbo.js
 * 
 * @author		Neil Rackett
 */
conbo.ConboEvent = conbo.Event.extend
({
	initialize: function(type, options)
	{
		conbo.defaults(this, options);
	},
	
	toString: function()
	{
		return 'conbo.ConboEvent';
	}
},
// Static properties
{
	ALL:					'*', 				// special event fires for any triggered event
	
	// General
	
	ERROR:					'error', 			// (Properties: model, xhr, options) when a model's save call fails on the server.
	INVALID:				'invalid', 			// (Properties: model, error, options) when a model's validation fails on the client.
	CHANGE:					'change', 			// (Properties: model, options) when a Bindable instance's attributes have changed.
												// 'change:[attribute]' (Properties: model, value, options when a specific attribute has been updated.
	ADD:					'add', 				// (Properties: model, collection, options) when a model is added to a collection.
	REMOVE:					'remove', 			// (Properties: model, collection, options) when a model is removed from a collection.
	DESTROY:				'destroy', 			// (Properties: model, collection, options) when a model is destroyed.
	RESET:					'reset', 			// (Properties: collection, options) when the collection's entire contents have been replaced.
	SORT:					'sort', 			// (Properties: collection, options) when the collection has been re-sorted.
	
	REQUEST:				'request', 			// (Properties: model, xhr, options) when a model (or collection) has started a request to the server.
	SYNC:					'sync', 			// (Properties: model, response, options) when a model (or collection) has been successfully synced with the server.
	
	ROUTE:					'route', 			// (Properties: router, route, params) Fired by history (or router) when any route has been matched.
												// 'route:[name]' // (Properties: params) Fired by the router when a specific route is matched.
	// View
	
	TEMPLATE_LOADED:		'templateloaded',	// Template data has been loaded into the View
	BIND:					'bind',				// Fired by an element after having one or more property bound to it by Conbo
	VIEW_BOUND:				'viewbound',		// All elements in View HTML have been bound by Conbo 
	INIT:					'init',				// For a View, this means template loaded, elements bound, DOM rendered  
	
	ELEMENT_CHANGE:			'elementchange',	// The View's element has changed
	
	// Web Services
	
	RESULT:					'result',			// HTTP service result
	FAULT:					'fault',			// HTTP service fault
	
});

_denumerate(conbo.ConboEvent.prototype);
