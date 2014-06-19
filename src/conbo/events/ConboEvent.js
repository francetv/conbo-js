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
		_.defaults(this, options);
	},
	
	toString: function()
	{
		return 'conbo.ConboEvent';
	}
},
// Static properties
{
	CHANGE:		"change", 	// (Properties: model, options) — when a Bindable instance's attributes have changed.
							// "change:[attribute]" (Properties: model, value, options — when a specific attribute has been updated.
	ALL:		"all", 		// special event fires for any triggered event
});
