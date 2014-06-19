Conbo.js Lite
=============

Conbo.js Lite is a super lightweight (<4KB minified+gzipped) subset of the Conbo.js MVC application framework for JavaScript, featuring extendible classes and a simple event model which enables consistent, scoped event handling.

The aim of this subset is to offer the benefits of Conbo's class structure and event model to users who want to create framework independent modules and code libraries.

Extendible classes
------------------

There's no messing about with prototypes in Conbo.js, instead all of your classes extend from another, for example:

```javascript
var MyClass = conbo.Class.extend
({
	initialize: function()
	{
		console.log('Welcome to my class!');
	}
});
```

Consistent event model
----------------------

You don't have to remember how many arguments each event handler should have, or in which order they're in, because Conbo.js has a single, consistent event model that offers predictable results.

All events fired by the framework are `conbo.ConboEvent` event objects, and you can easily create events of your own by using or extending the `conbo.Event` class in the same way you would extend any other.

Dependencies
------------

None.

Building
--------

Builds are created using Grunt, which requires Node.js; all required modules can be installed by running "npm install" from the command line in the project folder.

The builds listed above can be created using the command "grunt". Use "grunt watch", or run watch.cmd (Windows) or ./watch.sh (Mac, Linux) to auto-build as you edit.
