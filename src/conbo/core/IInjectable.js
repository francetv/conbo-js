/**
 * Injectable
 * 
 * Partial class that enables the Conbo.js framework to add the Context class 
 * to inject specified dependencies (properties of undefined value which match 
 * registered singletons); should be used via the Class.implement method
 * 
 * @example		var C = conbo.Class.extend().implement(conbo.IInjectable);
 * @author		Neil Rackett
 */

conbo.IInjectable =
{
	get context()
	{
		return this.__context__;
	},
	
	set context(value)
	{
		if (value == this.__context__) return;
		
		if (value instanceof conbo.Context) 
		{
			value.injectSingletons(this);
		}
		
		this.__context__ = value;
		
		_denumerate(this, '__context__');
	}
};