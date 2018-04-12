const { DateTime } = require('luxon');

function dateToISO(str) {
  return DateTime.fromJSDate(str).toISO({
    includeOffset: true,
    suppressMilliseconds: true,
  });
}

// .eleventy.js
module.exports = function(eleventyConfig) {
  eleventyConfig.addCollection('postsReversed', function(collection) {
    return collection
      .getFilteredByTag('post')
      .reverse()
      .map(item => ({
        ...item,
        isoDate: dateToISO(item.date),
      }));
  });

  // copy over the upcoming classes json file, to be consumed as an "api" endpoint.
  eleventyConfig.addPassthroughCopy('_data/classes');
  eleventyConfig.addPassthroughCopy('admin');

  return {
    templateFormats: ['md', 'pug', 'njk', 'png', 'jpg', 'gif', 'css', 'html'],
    passthroughFileCopy: true,
    dir: {
      input: '.',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about it.
    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for URLs (it does not affect your file structure)
    pathPrefix: '',
    nunjucksFilters: {
      lastUpdatedDate: collection => {
        // Newest date in the collection
        return dateToISO(collection[collection.length - 1].date);
      },
      rssDate: dateObj => {
        return dateToISO(dateObj);
      },

      url: url => {
        // If your blog lives in a subdirectory, change this:
        let rootDir = '/blog/';
        if (!url || url === '/') {
          return rootDir;
        }
        return rootDir + url;
      },
    },
  };
};
