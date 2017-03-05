var express = require('express');
var router = express.Router();
var request = require('request');
var cache = require('memory-cache');

var getContent = function() {
  return new Promise((resolve, reject) => {
    request('https://api.myjson.com/bins/1gfc5h', (err, res, body) => {
      if (err) {
        reject(err); return;
      }
      cache.put('content', body, (5 * 60 * 1000)); // store it in memory cache for 5 minutes
      resolve(body);
    });
  });
}

var getContentMiddleware = function(req, res, next) {
  var cachedContent = cache.get('content');
 
  if (cachedContent !== null) {
    res.locals.content = cachedContent;
    next();
  } else {
    getContent().then(function(json) {
      res.locals.content = json;
      next();
    });
  }
}

router.get('/', getContentMiddleware, function(req, res, next) {
  res.render('index', { title: 'Express'});
});

module.exports = router;
