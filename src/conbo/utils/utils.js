var _ = {},
	slice = Array.prototype.slice,
	nativeBind = Function.protorype.bind,
	ctor = function(){};

_.extend = function(obj) 
{
	var args = slice.call(arguments, 1);
	
	args.forEach(function(source) 
	{
		if (source) 
		{
			for (var prop in source) 
			{
				obj[prop] = source[prop];
			}
		}
	});
	
	return obj;
};

_.bind = function(func, context) 
{
	var args, bound;
	
	if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
	
	args = slice.call(arguments, 2);
	
	return bound = function() 
	{
		if (!(this instanceof bound))
		{
			return func.apply(context, args.concat(slice.call(arguments)));
		}
		
		ctor.prototype = func.prototype;
		var self = new ctor;
		ctor.prototype = null;
		var result = func.apply(self, args.concat(slice.call(arguments)));
		if (Object(result) === result) return result;
		return self;
	};
};

_.bindAll = function(object) 
{
	var funcs = arguments.length > 1 
			? slice.call(arguments, 1)
			: _functions(object),
		index = -1,
		length = funcs.length;
	
	while (++index < length) 
	{
		var key = funcs[index];
		object[key] = createWrapper(object[key], 1, null, null, object);
	}
	
	return object;
}

_.functions = function(obj) 
{
	var names = [];
	
	for (var key in obj) 
	{
		if (typeof obj[key] === 'function') names.push(key);
	}
	
	return names.sort();
};

_.pick = function(obj) 
{
    var copy = {},
    	keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    
    keys.forEach(function(key) 
    {
    	if (key in obj) copy[key] = obj[key];
    });
    
    return copy;
};

//Fill in a given object with default properties.
_.defaults = function(obj) 
{
	slice.call(arguments, 1).forEach(function(source) 
	{
	    if (!!source) 
	    {
	    	for (var prop in source) 
	    	{
	    		if (obj[prop] === void 0) obj[prop] = source[prop];
	    	}
	    }
	});
	
	return obj;
};

//If the value of the named `property` is a function then invoke it with the
// `object` as context; otherwise, return it.
_.result = function(object, property) 
{
	if (object == null) return;
	var value = object[property];
	return typeof value == 'function' ? value.call(object) : value;
};

//Create a (shallow-cloned) duplicate of an object.
_.clone = function(obj) 
{
	if (obj instanceof Array) obj.slice();
	return _.extend({}, obj);
};
