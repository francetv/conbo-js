/**
 * conbo.Model
 *
 * Create a new model, with defined attributes. A client id (`cid`)
 * is automatically generated and assigned for you.
 * 
 * Derived from the Backbone.js class of the same name
 */
conbo.Model = conbo.Hash.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(properties, options) 
	{
		var defaults;
		var props = properties || {};
		
		options || (options = {});
		
		this.cid = conbo.uniqueId('c');
		
		_defineIncalculableProperty(this, '__properties__', {});
		conbo.extend(this, conbo.pick(options, ['url','urlRoot','collection']));
		
		if (options.parse)
		{
			props = this.parse(props, options) || {};
		}
		
		props = conbo.defaults({}, props, this.defaults);
		
		this.set(props, options);
		
		if (!!options) this.context = options.context;
		this.initialize.apply(this, arguments);
		
		conbo.makeBindable(this, this.bindable);
	},
	
	/**
	 * Return an object that can easily be converted into JSON
	 */
	toJSON: function()
	{
		return this.__properties__;
	},
	
	/**
	 * A hash of attributes whose current and previous value differ.
	 */
	changed: null,

	/**
	 * The value returned during the last failed validation.
	 */
	validationError: null,

	/**
	 * The default name for the JSON `id` attribute is `"id"`. MongoDB and
	 * CouchDB users may want to set this to `"_id"`.
	 */
	idProperty: 'id',

	/**
	 * Initialize is an empty function by default. Override it with your own
	 * initialization logic.
	 */
	initialize: function(){},

	/**
	 * Proxy `conbo.sync` by default -- but override this if you need
	 * custom syncing semantics for *this* particular model.
	 */
	sync: function() 
	{
		return conbo.sync.apply(this, arguments);
	},

	/**
	 * Get the value of an attribute.
	 */
	get: function(attr) 
	{
		return this.__properties__[attr];
	},

	/**
	 * Get the HTML-escaped value of an attribute.
	 */
	escape: function(attr) 
	{
		return conbo.escape(this.get(attr));
	},

	/**
	 * Returns `true` if the attribute contains a value that is not null
	 * or undefined.
	 */
	has: function(attr) 
	{
		return this.get(attr) != null;
	},

	/**
	 * Set a hash of model attributes on the object, firing `"change"`. This is
	 * the core primitive operation of a model, updating the data and notifying
	 * anyone who needs to know about the change in state. The heart of the beast.
	 */
	set: function(key, val, options) 
	{
		var attr, attrs, unset, changes, silent, changing, prev, current;
		
		if (key == null)
		{
			return this;
		}

		// Handle both `"key", value` and `{key: value}` -style arguments.
		if (typeof key === 'object')
		{
			attrs = key;
			options = val;
		}
		else
		{
			(attrs = {})[key] = val;
		}

		options || (options = {});

		// Run validation.
		if (!this._validate(attrs, options))
		{
			return false;
		}
		
		// Extract attributes and options.
		unset					 = options.unset;
		silent					= options.silent;
		changes				 = [];
		changing				= this._changing;
		this._changing	= true;
		
		if (!changing) 
		{
			this._previousAttributes = conbo.clone(this.__properties__);
			this.changed = {};
		}
		
		current = this.__properties__;
		prev = this._previousAttributes;

		// Check for changes of `id`.
		if (this.idProperty in attrs)
		{
			this.id = attrs[this.idProperty];
		}

		// For each `set` attribute, update or delete the current value.
		for (attr in attrs) 
		{
			val = attrs[attr];
			
			if (!conbo.isEqual(current[attr], val)) 
			{
				changes.push(attr);
			}
			
			if (!conbo.isEqual(prev[attr], val)) 
			{
				this.changed[attr] = val;
			}
			else 
			{
				delete this.changed[attr];
			}
			
			unset ? delete current[attr] : current[attr] = val;
		}
		
		// Trigger all relevant attribute changes.
		if (!silent) 
		{
			if (changes.length) this._pending = true;
			
			for (var i=0, l=changes.length; i<l; i++) 
			{
				this.dispatchEvent(new conbo.ConboEvent('change:'+changes[i],
				{
					model: this,
					value: current[changes[i]], 
					options: options, 
					attribute: changes[i]
				}));
			}
		}
		
		// You might be wondering why there's a `while` loop here. Changes can
		// be recursively nested within `"change"` events.
		if (changing)
		{
			return this;
		}
		
		if (!silent) 
		{
			while (this._pending) 
			{
				this._pending = false;
				
				this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.CHANGE,
				{
					model: this,
					options: options
				}));
			}
		}
		
		this._pending = false;
		this._changing = false;
		
		return this;
	},

	/**
	 * Remove an attribute from the model, firing `"change"`. `unset` is a noop
	 * if the attribute doesn't exist.
	 */
	unset: function(attr, options) 
	{
		return this.set(attr, undefined, conbo.extend({}, options, {unset: true}));
	},

	/**
	 * Clear all attributes on the model, firing `"change"`.
	 */
	clear: function(options) 
	{
		var attrs = {};
		for (var key in this.__properties__) attrs[key] = undefined;
		return this.set(attrs, conbo.extend({}, options, {unset: true}));
	},

	/**
	 * Determine if the model has changed since the last `"change"` event.
	 * If you specify an attribute name, determine if that attribute has changed.
	 */
	hasChanged: function(attr) 
	{
		if (attr == null) return !conbo.isEmpty(this.changed);
		return attr in this.changed;
	},
	
	/**
	 * Return an object containing all the attributes that have changed, or
	 * false if there are no changed attributes. Useful for determining what
	 * parts of a view need to be updated and/or what attributes need to be
	 * persisted to the server. Unset attributes will be set to undefined.
	 * You can also pass an attributes object to diff against the model,
	 * determining if there *would be* a change.
	 */
	changedAttributes: function(diff) 
	{
		if (!diff) return this.hasChanged() ? conbo.clone(this.changed) : false;
		var val, changed = false;
		var old = this._changing ? this._previousAttributes : this.__properties__;
		for (var attr in diff) {
			if (conbo.isEqual(old[attr], (val = diff[attr]))) continue;
			(changed || (changed = {}))[attr] = val;
		}
		return changed;
	},

	/**
	 * Get the previous value of an attribute, recorded at the time the last
	 * `"change"` event was fired.
	 */
	previous: function(attr) 
	{
		if (attr == null || !this._previousAttributes) return null;
		return this._previousAttributes[attr];
	},

	/**
	 * Get all of the attributes of the model at the time of the previous
	 * `"change"` event.
	 */
	previousAttributes: function() 
	{
		return conbo.clone(this._previousAttributes);
	},

	/**
	 * Fetch the model from the server. If the server's representation of the
	 * model differs from its current attributes, they will be overridden,
	 * triggering a `"change"` event.
	 */
	fetch: function(options) 
	{
		options = options ? conbo.clone(options) : {};
		
		if (options.parse === undefined)
		{
			options.parse = true;
		}
		
		var success = options.success;
		
		options.success = this.bind(function(resp)
		{
			if (!this.set(this.parse(resp, options), options))
			{
				return false;
			}
			
			if (!!success) 
			{
				success(this, resp, options);
			}
			
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.SYNC,
			{
				model:		this,
				response:	resp,
				options:	options
			}));
		});
		
		wrapError(this, options);
		
		return this.sync('read', this, options);
	},
	
	/**
	 * Set a hash of model attributes, and sync the model to the server.
	 * If the server returns an attributes hash that differs, the model's
	 * state will be `set` again.
	 */
	save: function(key, val, options) 
	{
		var attrs, method, xhr, attributes = this.__properties__;
		
		// Handle both `"key", value` and `{key: value}` -style arguments.
		if (key == null || typeof key === 'object')
		{
			attrs = key;
			options = val;
		}
		else
		{
			(attrs = {})[key] = val;
		}

		// If we're not waiting and attributes exist, save acts as `set(attr).save(null, opts)`.
		if (attrs && (!options || !options.wait) && !this.set(attrs, options)) 
		{
			return false;
		}

		options = conbo.extend({validate: true}, options);

		// Do not persist invalid models.
		if (!this._validate(attrs, options)) 
		{
			return false;
		}

		// Set temporary attributes if `{wait: true}`.
		if (attrs && options.wait)
		{
			this.__properties__ = conbo.extend({}, attributes, attrs);
		}

		// After a successful server-side save, the client is (optionally)
		// updated with the server-side state.
		if (options.parse === undefined) 
		{
			options.parse = true;
		}
			
		var model = this;
		var success = options.success;
			
		options.success = function(resp) 
		{
			// Ensure attributes are restored during synchronous saves.
			model.__properties__ = attributes;
			
			var serverAttrs = model.parse(resp, options);
			
			if (options.wait) 
			{
				serverAttrs = conbo.extend(attrs || {}, serverAttrs);
			}
			
			if (conbo.isObject(serverAttrs) && !model.set(serverAttrs, options)) 
			{
				return false;
			}
			
			if (success) 
			{
				success(model, resp, options);
			}
			
			model.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.SYNC,
			{
				model: model,
				response: resp, 
				options: options
			}));
		};
			
		wrapError(this, options);

		method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
		if (method === 'patch') options.attrs = attrs;
		xhr = this.sync(method, this, options);

		// Restore attributes.
		if (attrs && options.wait) this.__properties__ = attributes;
		
		return xhr;
	},

	/**
	 * Destroy this model on the server if it was already persisted.
	 * Optimistically removes the model from its collection, if it has one.
	 * If `wait: true` is passed, waits for the server to respond before removal.
	 */
	destroy: function(options) 
	{
		options = options ? conbo.clone(options) : {};
		
		var model = this;
		var success = options.success;
		
		var destroy = this.bind(function() 
		{
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.DESTROY,
			{
				model: this,
				collection: model.collection,
				options: options
			}));
		});
		
		options.success = function(resp)
		{
			if (options.wait || model.isNew())
			{
				destroy();
			}
			
			if (success) 
			{
				success(model, resp, options);
			}
			
			if (!model.isNew()) 
			{
				model.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.SYNC, 
				{
					model: model, 
					response: resp, 
					options: options
				}));
			}
		};
		
		if (this.isNew()) 
		{
			options.success();
			return false;
		}
		
		wrapError(this, options);

		var xhr = this.sync('delete', this, options);
		if (!options.wait) destroy();
		
		return xhr;
	},

	/**
	 * Default URL for the model's representation on the server -- if you're
	 * using conbo's restful methods, override this to change the endpoint
	 * that will be called.
	 */
	url: function() 
	{
		var base = this.urlRoot || this.collection.url || urlError();
		if (this.isNew()) return base;
		return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
	},

	/**
	 * Converts a response into the hash of attributes to be `set` on
	 * the model. The default implementation is just to pass the response along.
	 */
	parse: function(resp, options) 
	{
		return resp;
	},

	/**
	 * Create a new model with identical attributes to this one.
	 */
	clone: function() 
	{
		return new this.constructor(this.__properties__);
	},

	/**
	 * A model is new if it has never been saved to the server, and lacks an id.
	 */
	isNew: function() 
	{
		return this.id == null;
	},

	/**
	 * Check if the model is currently in a valid state.
	 */
	isValid: function(options) 
	{
		return this._validate({}, conbo.extend(options || {}, { validate: true }));
	},
	
	toString: function()
	{
		return 'conbo.Model';
	},

	/**
	 * Run validation against the next complete set of model attributes,
	 * returning `true` if all is well. Otherwise, fire an `"invalid"` event.
	 */
	_validate: function(attrs, options) 
	{
		if (!options.validate || !this.validate) return true;
		attrs = conbo.extend({}, this.__properties__, attrs);
		var error = this.validationError = this.validate(attrs, options) || null;
		if (!error) return true;
		
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.INVALID,
		{
			model: 		this,
			error: 		error,
			options: 	conbo.extend(options || {}, {validationError: error})
		}));
		
		return false;
	}
});

//Utility methods that we want to implement
var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit', 'size'];

//Mix in each available utility methods
conbo.forEach(modelMethods, function(method)
{
	if (!(method in conbo)) return;
	
	conbo.Model.prototype[method] = function() 
	{
		return conbo[method].apply(conbo, [this.__properties__].concat(conbo.rest(arguments)));
	};
});

//TODO Don't have this here?
//Wrap an optional error callback with a fallback error event.
var wrapError = function (model, options)
{
	var callback = options.error;
	
	options.error = function(resp) 
	{
		if (!!callback) callback(model, resp, options);
		
		model.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ERROR,
		{
			model:model, 
			response:resp, 
			options:options
		}));
	};
};

_denumerate(conbo.Model.prototype);
