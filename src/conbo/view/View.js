/**
 * View
 * 
 * Creating a conbo.View creates its initial element outside of the DOM,
 * if an existing element is not provided...
 * 
 * Some methods derived from the Backbone.js class of the same name
 */
conbo.View = conbo.Bindable.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		console.log("ARSE!");
		
		options = _.clone(options) || {};
		
		this._configure(options);
		this._ensureElement();
		
		this.initialize.apply(this, arguments);
	},
	
	/**
	 * The default `tagName` of a View's element is `"div"`.
	 */
	tagName: 'div',
	
	/**
	 * Initialize is an empty function by default. Override it with your own
	 * initialization logic.
	 */
	initialize: function(){},
	
	/**
	 * Your class should override **render**, which is called automatically 
	 * after your View is initialized. If you're using a template, this means
	 * **render** is called immediately after the template is applied to your
	 * View's element (`this.el`).
	 * 
	 * If you want to apply Lo-Dash, Mustache or any other third party
	 * templating to your View, this is the place to do it.
	 * 
	 * The convention is for **render** to always return `this`.
	 */
	render: function() 
	{
		return this;
	},
	
	/**
	 * Change the view's element (`this.el` property) and re-bind events
	 */
	setElement: function(element)
	{
		console.log('setElement', element);
		
		this.el = element;
		return this;
	},
	
	toString: function()
	{
		return 'conbo.View';
	},
	
	/**
	 * List of view options to be merged as properties.
	 */
	_viewOptions: 
	[
		'el', 
		'id', 
		'attributes', 
		'className', 
		'tagName', 
	],	
	
	/**
	 * Performs the initial configuration of a View with a set of options.
	 * Keys with special meaning *(model, collection, id, className)*, are
	 * attached directly to the view.
	 * 
	 * @private
	 */
	_configure: function(options) 
	{
		if (!!this.options) options = _.extend({}, this.options, options);
		_.extend(this, _.pick(options, this._viewOptions));
		this.options = options;
	},
	
	/**
	 * Ensure that the View has a DOM element to render into.
	 * If `this.el` is a string, pass it through `$()`, take the first
	 * matching element, and re-assign it to `el`. Otherwise, create
	 * an element from the `id`, `className` and `tagName` properties.
	 * 
	 * @private
	 */
	_ensureElement: function() 
	{
		if (!this.el) 
		{
			var attrs = _.extend({}, _.result(this, 'attributes'));
			var el = document.createElement(this.tagName);
			
			if (!!this.id) el.id = this.id;
			if (!!this.className) el.className = this.className;
			
			_.extend(el, attrs);
			
			this.setElement(el);
		}
		else 
		{
			this.setElement(this.el);
			if (!!this.className) this.el.className += ' '+this.className;
		}
	},
});
