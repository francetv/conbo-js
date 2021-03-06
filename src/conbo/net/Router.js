var optionalParam 	= /\((.*?)\)/g;
var namedParam		= /(\(\?)?:\w+/g;
var splatParam		= /\*\w+/g;
var escapeRegExp	= /[\-{}\[\]+?.,\\\^$|#\s]/g;

/**
 * Router
 * 
 * Routers map faux-URLs to actions, and fire events when routes are
 * matched. Creating a new one sets its `routes` hash, if not set statically.
 * 
 * Derived from the Backbone.js class of the same name
 */
conbo.Router = conbo.EventDispatcher.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options) 
	{
		options || (options = {});
		if (options.routes) this.routes = options.routes;
		this._bindRoutes();
		
		if (!!options) this.context = options.context;
		this.initialize.apply(this, arguments);
	},
	
	/**
	 * Manually bind a single named route to a callback. For example:
	 * 
	 * @example
	 * 		this.route('search/:query/p:num', 'search', function(query, num) {
	 * 			 ...
	 * 		});
	 */ 
	route: function(route, name, callback) 
	{
		if (!conbo.isRegExp(route)) 
		{
			route = this._routeToRegExp(route);
		}
		
		if (!callback) 
		{
			callback = this[name];
		}
		
		if (conbo.isFunction(name)) 
		{
			callback = name;
			name = '';
		}
		
		if (!callback) 
		{
			callback = this[name];
		}
		
		conbo.history.route(route, this.bind(function(fragment)
		{
			var args = this._extractParameters(route, fragment);
			
			callback && callback.apply(this, args);
			
			var options = 
			{
				router:		this,
				route:		route,
				name:		name,
				parameters:	args,
				fragment:	fragment
			}
			
			this.dispatchEvent(new conbo.ConboEvent('route:'+name, options));
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ROUTE, options));
			
			conbo.history.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ROUTE, options));
		}));
		
		return this;
	},
	
	/**
	 * Simple proxy to `conbo.history` to save a fragment into the history.
	 */
	navigate: function(fragment, options) 
	{
		conbo.history.navigate(fragment, options);
		return this;
	},
	
	navigateTo: function(fragment, options) 
	{
		options || (options = {});
		options.trigger = true;
		return this.navigate(fragment, options);
	},
	
	toString: function()
	{
		return 'conbo.Router';
	},
	
	/**
	 * Bind all defined routes to `conbo.history`. We have to reverse the
	 * order of the routes here to support behavior where the most general
	 * routes can be defined at the bottom of the route map.
	 * 
	 * @private
	 */
	_bindRoutes: function() 
	{
		if (!this.routes) return;
		this.routes = this.routes;
		var route, routes = conbo.keys(this.routes);
		
		while ((route = routes.pop()) != null)
		{
			this.route(route, this.routes[route]);
		}
	},
	
	/**
	 * Convert a route string into a regular expression, suitable for matching
	 * against the current location hash.
	 * 
	 * @private
	 */
	_routeToRegExp: function(route) 
	{
		route = route.replace(escapeRegExp, '\\$&')
			.replace(optionalParam, '(?:$1)?')
			.replace(namedParam, function(match, optional){
				return optional ? match : '([^\/]+)';
			})
			.replace(splatParam, '(.*?)');
		
		return new RegExp('^' + route + '$');
	},

	/**
	 * Given a route, and a URL fragment that it matches, return the array of
	 * extracted decoded parameters. Empty or unmatched parameters will be
	 * treated as `null` to normalize cross-browser behavior.
	 * 
	 * @private
	 */
	_extractParameters: function(route, fragment) 
	{
		var params = route.exec(fragment).slice(1);
		
		return conbo.map(params, function(param) {
			return param ? decodeURIComponent(param) : null;
		});
	}
	
}).implement(conbo.IInjectable);

_denumerate(conbo.Router.prototype);
