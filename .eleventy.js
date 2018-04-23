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
    const result = collection
      .getAll()
      .filter(item => item.data.layout === 'blog')
      .reverse()
      .map(item => ({
        ...item,
        isoDate: dateToISO(item.date),
      }));
    return result;
  });

  // copy over the upcoming classes json file, to be consumed as an "api" endpoint.
  eleventyConfig.addPassthroughCopy('_data/classes/upcoming.json');
  eleventyConfig.addPassthroughCopy('admin');
  eleventyConfig.addPassthroughCopy('static/img');
  eleventyConfig.addPassthroughCopy('static/js');

  eleventyConfig.addFilter('readableDate', dateObj => {
    return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_FULL);
  });

  return {
    templateFormats: [
      'md',
      'pug',
      'njk',
      'png',
      'jpg',
      'gif',
      'css',
      'html',
      'ico',
      'svg',
      'webmanifest',
      'xml',
    ],
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
        if (collection === undefined) {
          return null;
        }
        return dateToISO(collection[collection.length - 1].date);
      },
      rssDate: dateObj => {
        return dateToISO(dateObj);
      },
      readableDate: dateObj => {
        return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_FULL);
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
