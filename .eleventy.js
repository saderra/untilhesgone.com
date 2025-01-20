const fs = require("fs");
const now = String(Date.now())
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");


module.exports = function (eleventyConfig) { 


    // PASS THROUGH
    eleventyConfig.addPassthroughCopy("./src/images");

    // PLUGINS
    eleventyConfig.addPlugin(eleventyNavigationPlugin);

    eleventyConfig.addWatchTarget('./tailwind.config.js')
    eleventyConfig.addWatchTarget('./src/assets/css/tailwind.css')

    //SHORTCODES
    eleventyConfig.addShortcode('version', function () { return now  })
  
    return { 
        dir: { 
            input: "src",
            output: "_site",
            includes: "_includes",
            layouts: "_includes/layouts"
        },
    };

};
  