/**
 * conbo.Context
 * 
 * This is your application's event bus and dependency injector, and is
 * usually where all your models and web service classes are registered,
 * using mapSingleton(...), and Command classes are mapped to events 
 * 
 * @author		Neil Rackett
 */
conbo.Context = conbo.EventDispatcher.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		options || (options = {});
		
		_defineIncalculableProperty(this, '__commands__', {});
		_defineIncalculableProperty(this, '__singletons__', {});
		
		this.app = options.app;
		
		this.addEventListener(conbo.Event.ALL, this._allHandler);
		this.initialize.apply(this, arguments);
		
		conbo.makeBindable(this, this.bindable);
	},
	
	/**
	 * Initialize: Override this
	 * @param options
	 */
	initialize: function(options) {},
	
	/**
	 * Map specified Command class the given event
	 */
	mapCommand: function(eventType, commandClass)
	{
		if (!eventType) throw new Error('eventType cannot be undefined');
		if (!commandClass) throw new Error('commandClass cannot be undefined');
		
		if (this._mapMulti(eventType, commandClass, this.mapCommand)) return;
		
		if (this.__commands__[eventType] && this.__commands__[eventType].indexOf(commandClass) != -1)
		{
			return;
		}
		
		this.__commands__[eventType] = this.__commands__[eventType] || [];
		this.__commands__[eventType].push(commandClass);
		
		return this;
	},
	
	/**
	 * Unmap specified Command class from given event
	 */
	unmapCommand: function(eventType, commandClass)
	{
		if (!eventType) throw new Error('eventType cannot be undefined');
		if (this._mapMulti(eventType, commandClass, this.unmapCommand)) return;
		
		if (commandClass === undefined)
		{
			delete this.__commands__[eventType];
			return;
		}
		
		if (!this.__commands__[eventType]) return;
		var index = this.__commands__[eventType].indexOf(commandClass);
		if (index == -1) return;
		this.__commands__[eventType].splice(index, 1);
		
		return this;
	},
	
	/**
	 * Map class instance to a property name
	 * 
	 * To inject a property into a class, register the property name
	 * with the Context and set the value of the property in your
	 * class to 'use inject' 
	 * 
	 * @example		context.mapSingleton('myProperty', MyModel);
	 * @example		myProperty: undefined
	 */
	mapSingleton: function(propertyName, singletonClass)
	{
		if (!propertyName) throw new Error('propertyName cannot be undefined');
		if (!singletonClass) throw new Error('singletonClass cannot be undefined');
		
		if (this._mapMulti(propertyName, singletonClass, this.mapSingleton)) return;
		
		this.__singletons__[propertyName] = conbo.isClass(singletonClass)
			// TODO Improved dynamic class instantiation
			? new singletonClass(arguments[2], arguments[3], arguments[4])
			: singletonClass;
			
		return this;
	},
	
	/**
	 * Unmap class instance from a property name
	 */
	unmapSingleton: function(propertyName)
	{
		if (!propertyName) throw new Error('propertyName cannot be undefined');
		if (this._mapMulti(propertyName, null, this.unmapSingleton)) return;
		
		if (!this.__singletons__[propertyName]) return;
		delete this.__singletons__[propertyName];
		
		return this;
	},
	
	/**
	 * Add this context to the specified Object
	 */
	addTo: function(obj)
	{
		return conbo.extend(obj || {}, {context:this});
	},
	
	/**
	 * Inject singleton instances into specified object
	 */
	injectSingletons: function(obj)
	{
		for (var a in obj)
		{
			if (obj[a] !== undefined) continue;
			
			if (a in this.__singletons__)
			{
				obj[a] = this.__singletons__[a];
			}
		}
		
		return this;
	},
	
	toString: function()
	{
		return 'conbo.Context';
	},
	
	/**
	 * @private
	 */
	_allHandler: function(event)
	{
		var commands = conbo.union(this.__commands__.all || [], this.__commands__[event.type] || []);
		if (!commands.length) return;
		
		conbo.forEach(commands, function(commandClass, index, list)
		{
			this._executeCommand(commandClass, event);
		}, 
		this);
	},
	
	/**
	 * @private
	 */
	_executeCommand: function(commandClass, event)
	{
		var command, options;
		
		options = {event:event};
		
		command = new commandClass(this.addTo(options));
		command.execute();
		command = null;
		
		return this;
	},
	
	/**
	 * @private
	 */
	_mapMulti: function(n, c, f)
	{
		if (conbo.isArray(n) || n.indexOf(' ') == -1) return false;
		var names = conbo.isArray(n) ? n : n.split(' ');
		conbo.forEach(names, function(e) { f(e,c); }, this);
		return true;
	}
	
});

_denumerate(conbo.Context.prototype);
