const fs = require("fs");
const now = String(Date.now())
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");


module.exports = function (eleventyConfig) { 


    // PASS THROUGH
    eleventyConfig.addPassthroughCopy("./src/images");
    eleventyConfig.addPassthroughCopy('./src/ext')
    eleventyConfig.addPassthroughCopy("./src/robots.txt");
    eleventyConfig.addPassthroughCopy("./src/sitemap.xml");
    eleventyConfig.addPassthroughCopy("./src/llms.txt");
    eleventyConfig.addPassthroughCopy("./src/favicon.svg");
    eleventyConfig.addPassthroughCopy("./src/og-image.png");

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
  