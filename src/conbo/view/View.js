/**
 * View
 * 
 * Creating a conbo.View creates its initial element outside of the DOM,
 * if an existing element is not provided...
 * 
 * Some methods derived from the Backbone.js class of the same name
 */
conbo.View = conbo.Glimpse.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		options = conbo.clone(options) || {};
		
		var viewOptions = 
		[
			'attributes',
			'className', 
			'data', 
			'el', 
			'id', 
			'tagName', 
			'template', 
			'templateUrl',
			'parent'
		];
		
		conbo.extend(this, conbo.pick(options, viewOptions));
		
		this._ensureElement();
		
		this.context = options.context;
		
 		this.initialize.apply(this, arguments);
 		
		conbo.makeBindable(this, this.bindable);
		
		var templateUrl = this.templateUrl,
			template = this.template;
		
		if (!!templateUrl)
		{
			this.loadTemplate(templateUrl);
		}
		else
		{
			if (!!template && conbo.isString(template))
			{
				this.$el.html(template);
			}
			
			this._initView();
		}
	},
	
	/**
	 * jQuery delegate for element lookup, scoped to DOM elements within the
	 * current view. This should be prefered to global lookups where possible.
	 */
	$: function(selector)
	{
		return this.$el.find(selector);
	},
	
	/**
	 * Take the View's element element out of the DOM
	 */
	detach: function() 
	{
		delete this.parent;
		this.$el.detach();		
		
		return this;
	},
	
	/**
	 * Remove and destroy this View by taking the element out of the DOM, 
	 * unbinding it and removing all event listeners
	 */
	remove: function()
	{
		delete this.parent;
		
		this.unbindView()
			.removeEventListener();
		
		this.$el.remove();
		
		return this;
	},
	
	/**
	 * Change the view's element (`this.el` property) and re-bind events
	 */
	setElement: function(element)
	{
		var isBound = !!this.__bindings__;
		
		if (!!this.el) delete this.el.cbView;
		if (isBound) this.unbindView();
		
		_defineIncalculableProperty(this, '$el', $(element));
		_defineIncalculableProperty(this, 'el', this.$el[0]);
		
		this.el.cbView = this;
		
		if (isBound) this.bindView();
		
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ELEMENT_CHANGE));
		
		return this;
	},
	
	/**
	 * Append this DOM element from one View class instance this class 
	 * instances DOM element
	 * 
	 * @param 		view
	 * @returns 	this
	 */
	appendView: function(view)
	{
		if (arguments.length > 1)
		{
			conbo.forEach(arguments, function(view, index, list) 
			{
				this.appendView(view);
			},
			this);
			
			return this;
		}
		
		if (!(view instanceof conbo.View))
		{
			throw new Error('Parameter must be instance of conbo.View class');
		}
	
		view.parent = this;
		this.$el.append(view.el);
		
		return this;
	},
	
	/**
	 * Prepend this DOM element from one View class instance this class 
	 * instances DOM element
	 * 
	 * @param 		view
	 * @returns 	this
	 */
	prependView: function(view)
	{
		if (arguments.length > 1)
		{
			conbo.forEach(arguments, function(view, index, list) 
			{
				this.prependView(view);
			}, 
			this);
			
			return this;
		}
		
		if (!(view instanceof conbo.View))
		{
			throw new Error('Parameter must be instance of conbo.View class');
		}
		
		view.parent = this;
		this.$el.prepend(view.el);
		
		return this;
	},
	
	/**
	 * Automatically bind elements to properties of this View
	 * 
	 * @example	<div cb-bind="property|parseMethod" cb-hide="property">Hello!</div> 
	 * @returns	this
	 */
	bindView: function()
	{
		conbo.BindingUtils.bindView(this);
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.VIEW_BOUND));
		return this;
	},
	
	/**
	 * Unbind elements from class properties
	 * @returns	this
	 */
	unbindView: function() 
	{
		conbo.BindingUtils.unbindView(this);
		return this;
	},
	
	/**
	 * Loads HTML template and apply it to this.el, storing the loaded
	 * template will in this.template
	 * 
	 * @param 	{String}	url			A string containing the URL to which the request is sent
	 * @param 	{Object}	data		A plain object or string that is sent to the server with the request
	 * @param 	{Function} 	callback	Callback in format function(responseText, textStatus, xmlHttpRequest)
	 * 
	 * @see					https://api.jquery.com/load/
	 */
	loadTemplate: function(url, data, callbackFunction)
	{
		this.unbindView();
		
		var completeHandler = this.bind(function(response, status, xhr)
		{
			this.template = response;
			
			if (!!callbackFunction)
			{
				callbackFunction.apply(this, arguments);
			}
			
			this._initView();
		});
		
		this.$el.load(url, data, completeHandler);
	},	
	
	toString: function()
	{
		return 'conbo.View';
	},
	
	/**
	 * Populate and render the View's HTML content
	 */
	_initView: function()
	{
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.TEMPLATE_LOADED));
		this.render();
		this.bindView();
		
		conbo.defer(this.bind(function()
		{
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.INIT));
		}));
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
		var attrs = conbo.extend({}, this.attributes);
		
		if (!this.el) 
		{
			if (this.id) attrs.id = this.id;
			this.setElement($('<'+this.tagName+'>'));
		}
		else 
		{
			this.setElement(this.el);
		}
		
		if (this.className) 
		{
			this.$el.addClass(this.className);
		}
		
		this.$el.attr(attrs);
		
		if (this instanceof conbo.Application)
		{
			this.$el.addClass('cb-app');
		}
		
		this.$el.addClass('cb-view');
	},
});

_denumerate(conbo.View.prototype);
