module.exports = function (grunt) 
{
	grunt.initConfig
	({
		concat:
		{
			all:
			{
				files:
				{
					"temp/conbo.lite.tmp":
					[
					 	"src/conbo/utils/utils.js",
					 	"src/conbo/core/Class.js",
						"src/conbo/events/Event.js",
						"src/conbo/events/ConboEvent.js",
						"src/conbo/events/EventDispatcher.js",
						"src/conbo/core/Bindable.js",
						"src/conbo/data/Hash.js",
						"src/conbo/view/Glimpse.js"
					],
					
					"build/conbo.lite.js":
					[
						"src/conbo/header.txt",
						"temp/conbo.lite.tmp",
						"src/conbo/footer.txt"
					]
				}
			}
		},
		
		clean: ['temp'],
		
		uglify: 
		{
			lite: 
			{
				src: 'build/conbo.lite.js',
				dest: 'build/conbo.lite.min.js'
			}
		},
		
		watch: 
		{
			js: 
			{
				files: ['src/conbo/**/*.js', 'src/conbo/*.txt'],
				tasks: ['concat','clean','uglify']
			}
		}
		
	});
	
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	
	grunt.registerTask('default', ['concat','clean','uglify']);
};
