/**
 * Context & dependency injection example for Conbo.js
 * @author	Neil Rackett
 */
(function()
{
	var WarningCommand = conbo.Command.extend
	({
		myModel: undefined,
		
		execute: function()
		{
			alert('Watch out '+this.myModel.get('name')+'!');
		}
	});
	
	/**
	 * Switch conbo.Hash for conbo.Model if you need web services
	 */
	var MyModel = conbo.Hash.extend
	({
		defaults: 
		{
			name: 'Conbo'
		}
	});
	
	var InputView = conbo.View.extend
	({
		/**
		 * Properties with a value of undefined that have been mapped to 
		 * singletons in the context are automatically injected
		 */
		myModel: undefined,
		
		template: 'My name is <input type="text" cb-bind="myModel.name" /><button>Submit</button>',
		
		events:
		{
			'click button': 'button_clickHandler'
		},
		
		button_clickHandler: function()
		{
			this.context().trigger(new conbo.Event('warning'));
		}
	});
	
	var MyContext = conbo.Context.extend
	({
		/**
		 * Entry point
		 */
		initialize: function()
		{
			this.mapCommand('warning', WarningCommand);
			this.mapSingleton('myModel', MyModel);
		}
	});
	
	var MyApp = conbo.Application.extend
	({
		/**
		 * Application will automatically use an instance of this class as 
		 * the application's context (event bus); uses vanilla conbo.Context
		 * if not specified
		 */
		contextClass: MyContext,
		
		/**
		 * Entry point
		 */
		initialize: function()
		{
			this.inputView = new InputView(this.context().addTo());
			this.appendView(this.inputView);
		}
	});
	
	new MyApp({el:document.body});
	
})();