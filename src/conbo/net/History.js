// Cached regex for stripping a leading hash/slash and trailing space.
var routeStripper = /^[#\/]|\s+$/g;

// Cached regex for stripping leading and trailing slashes.
var rootStripper = /^\/+|\/+$/g;

// Cached regex for detecting MSIE.
var isExplorer = /msie [\w.]+/;

// Cached regex for removing a trailing slash.
var trailingSlash = /\/$/;

/**
 * conbo.History
 * 
 * Handles cross-browser history management, based on either
 * [pushState](http://diveintohtml5.info/history.html) and real URLs, or
 * [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
 * and URL fragments. If the browser supports neither (old IE, natch),
 * falls back to polling.
 * 
 * Derived from the Backbone.js class of the same name
 */
conbo.History = conbo.EventDispatcher.extend
({
	/**
	 * Has the history handling already been started?
	 */
	started: false,
	
	/**
	 * The default interval to poll for hash changes, if necessary, is
	 * twenty times a second.
	 */
	interval: 50,
	
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		this.handlers = [];
		this.bindAll('checkUrl');
		
		// Ensure that `History` can be used outside of the browser.
		if (typeof window !== 'undefined')
		{
			this.location = window.location;
			this.history = window.history;
		}
		
		if (!!options) this.context = options.context;
		this.initialize.apply(this, arguments);
	},
	
	/**
	 * Gets the true hash value. Cannot use location.hash directly due
	 * to bug in Firefox where location.hash will always be decoded.
	 */
	getHash: function(window)
	{
		var match = (window || this).location.href.match(/#(.*)$/);
		return match ? match[1]: '';
	},
	
	/**
	 * Get the cross-browser normalized URL fragment, either from the
	 * URL, the hash, or the override.
	 */
	getFragment: function(fragment, forcePushState)
	{
		if (fragment == null)
		{
			if (this._hasPushState || !this._wantsHashChange || forcePushState)
			{
				fragment = this.location.pathname;
				var root = this.root.replace(trailingSlash, '');
				if (!fragment.indexOf(root)) 
				{
					fragment = fragment.substr(root.length);
				}
			}
			else
			{
				fragment = this.getHash();
			}
		}
		return fragment.replace(routeStripper, '');
	},
	
	/**
	 * Start the hash change handling, returning `true` if the current
	 * URL matches an existing route, and `false` otherwise.
	 */
	start: function(options)
	{
		if (this.started)
		{
			throw new Error("conbo.history has already been started");
		}
		
		this.started = true;
		
		// Figure out the initial configuration. Do we need an iframe?
		// Is pushState desired ... is it available?
		this.options = conbo.extend({}, {root:window.location.pathname}, this.options, options);
		this.root = this.options.root;
		this._wantsHashChange = this.options.hashChange !== false;
		this._wantsPushState = !!this.options.pushState;
		this._hasPushState = !!(this.options.pushState && this.history && this.history.pushState);
		
		var fragment = this.getFragment();
		var docMode = document.documentMode;
		
		// Normalize root to always include a leading and trailing slash.
		this.root = ('/' + this.root + '/').replace(rootStripper, '/');
		
		// Depending on whether we're using pushState or hashes,
		// determine how we check the URL state.
		if (this._hasPushState)
		{
			$(window).on('popstate', this.checkUrl);
		}
		else if (this._wantsHashChange && ('onhashchange' in window))
		{
			$(window).on('hashchange', this.checkUrl);
		}
		else if (this._wantsHashChange)
		{
			this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
		}
		
		// Determine if we need to change the base url, for a pushState
		// link
		// opened by a non-pushState browser.
		this.fragment = fragment;
		
		var loc = this.location;
		var atRoot = loc.pathname.replace(/[^\/]$/, '$&/') === this.root;
		
		// If we've started off with a route from a `pushState`-enabled
		// browser, but we're currently in a browser that doesn't support it...
		if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot)
		{
			this.fragment = this.getFragment(null, true);
			this.location.replace(this.root + this.location.search + '#' + this.fragment);
			// Return immediately as browser will do redirect to new url
			return true;
			
			// Or if we've started out with a hash-based route, but we're currently
			// in a browser where it could be `pushState`-based instead...
		}
		else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash)
		{
			this.fragment = this.getHash().replace(routeStripper, '');
			this.history.replaceState(
			{}, document.title, this.root + this.fragment + loc.search);
		}
		
		if (!this.options.silent) 
		{
			return this.loadUrl();
		}
	},
	
	/**
	 * Disable conbo.history, perhaps temporarily. Not useful in a real app,
	 * but possibly useful for unit testing Routers.
	 */
	stop: function()
	{
		$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
		clearInterval(this._checkUrlInterval);
		this.started = false;
	},
	
	/**
	 * Add a route to be tested when the fragment changes. Routes added
	 * later may override previous routes.
	 */
	route: function(route, callback)
	{
		this.handlers.unshift({route:route, callback:callback});
	},
	
	/**
	 * Checks the current URL to see if it has changed, and if it has,
	 * calls `loadUrl`, normalizing across the hidden iframe.
	 */
	checkUrl: function(e)
	{
		var current = this.getFragment();
		if (current === this.fragment) return false;
		this.loadUrl() || this.loadUrl(this.getHash());
	},
	
	/**
	 * Attempt to load the current URL fragment. If a route succeeds with a
	 * match, returns `true`. If no defined routes matches the fragment, returns `false`.
	 */
	loadUrl: function(fragmentOverride)
	{
		var fragment = this.fragment = this.getFragment(fragmentOverride);
		
		var matched = conbo.any(this.handlers, function(handler)
		{
			if (handler.route.test(fragment))
			{
				handler.callback(fragment);
				return true;
			}
		});
		
		return matched;
	},
	
	/**
	 * Save a fragment into the hash history, or replace the URL state
	 * if the 'replace' option is passed. You are responsible for properly
	 * URL-encoding the fragment in advance.
	 * 
	 * The options object can contain `trigger: true` if you wish to have the
	 * route callback be fired (not usually desirable), or `replace: true`, if
	 * you wish to modify the current URL without adding an entry to the history.
	 */
	navigate: function(fragment, options)
	{
		if (!this.started) return false;
		
		if (!options || options === true)
		{
			options = {trigger: options};
		}
		
		fragment = this.getFragment(escape(fragment || ''));
		
		if (this.fragment === fragment) 
		{
			return;
		}
		
		this.fragment = fragment;
		var url = this.root + fragment;
		
		// If pushState is available, we use it to set the fragment as a
		// real URL.
		if (this._hasPushState)
		{
			this.history[options.replace ? 'replaceState': 'pushState']({}, document.title, url);
			
			// If hash changes haven't been explicitly disabled, update
			// the hash fragment to store history.
		}
		else if (this._wantsHashChange)
		{
			this._updateHash(this.location, fragment, options.replace);
			
			// If you've told us that you explicitly don't want fallback
			// hashchange-based history, then `navigate` becomes a page refresh.
		}
		else
		{
			return this.location.assign(url);
		}
		
		if (options.trigger) 
		{
			this.loadUrl(fragment);
		}
	},
	
	toString: function()
	{
		return 'conbo.History';
	},
	
	/**
	 * Update the hash location, either replacing the current entry, or
	 * adding a new one to the browser history.
	 */
	_updateHash: function(location, fragment, replace)
	{
		if (replace)
		{
			var href = location.href.replace(/(javascript:|#).*$/, '');
			location.replace(href + '#/' + fragment);
		}
		else
		{
			location.hash = '#/' + fragment;
		}
	}
	
}).implement(conbo.IInjectable);

_denumerate(conbo.History.prototype);

// Create default instance of the History class
conbo.history = new conbo.History();
