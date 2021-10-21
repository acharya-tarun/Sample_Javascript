// Script used by PhantomJS to load a webpage and capture all the valid JS links from the source HTML
// Outputs are returned back to the main script by logging to console (console.log)

// This script is also used to find out newsletter subscription form on webpage
// And subscribe to it using specified email id

//----------------- Page Variables--------------------//
var page = new WebPage();
var system = require('system');

// Variables needed for newsletter subscription script
// var step = 0, loadInProgress = false, mailbox_id = "tom@infer.biz", formindex = -1;

if (system.args.length === 1) {
  console.log("PhantomJS_ERROR: No URL provided");
  phantom.exit();
};

var url = system.args[1];
if (url === '') {
  console.log("PhantomJS_ERROR: Blank URL provided");
  phantom.exit();
}

if (url.indexOf("http://") == -1  && url.indexOf("https://") == -1)
{
  url = "http://" + url;
}
//----------------- Page Variables--------------------//


//----------------- Page Settings--------------------//
// Set User-Agent
page.settings.userAgent = system.args[2];
// Do not load images
// page.settings.loadImages = false;
// Timeout for each resource requested by webpage
page.settings.resourceTimeout = 20000; //20 secs
//----------------- Page Settings--------------------//


var pageLoadInstant = "", lastNetworkCallInstant = "";
var scriptStartInstant = new Date().getTime();

page.onResourceReceived = function(response) {
  lastNetworkCallInstant = new Date().getTime();
  var type = response.contentType;
  if(type && type.indexOf('javascript') > -1)
  {
    console.log("PhantomJS_SOURCE:" + response.url);
  }
};

page.onResourceRequested = function(response) {
  lastNetworkCallInstant = new Date().getTime();
};

page.onUrlChanged = function(targetUrl) {
  console.log("PhantomJS_REDIRECT" + targetUrl + "PhantomJS_REDIRECT");
};

function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 120000, //< Default Max Timout is 2 mins
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    // console.log("'waitFor()' timeout");
                    onPageReady();
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    // console.log("'waitFor()' finished in " + (new Date().getTime() - start)/1000 + " seconds");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
};

function onPageReady() {
  var htmlContent = page.evaluate(function () {
    return document.documentElement.outerHTML;
  });

  console.log("PhantomJS_CONTENT" + htmlContent + "PhantomJS_CONTENT");

  var cookies = page.cookies;    
  for(var i in cookies) {
    console.log("PhantomJS_COOKIES" + cookies[i].name + "PhantomJS_COOKIES");
  }
};

page.clearMemoryCache();

page.open(url, function (status) {
    pageLoadInstant = new Date().getTime();
    // console.log("Page took " + (pageLoadInstant - scriptStartInstant)/1000 + " seconds to load");
    // Check for page load success
    if (status !== "success") {
        console.log("PhantomJS_ERROR:page_load_failed:PhantomJS_ERROR");
        phantom.exit(1);
    } else {
        waitFor(function() {
            return (lastNetworkCallInstant !== "" && ((new Date().getTime() - lastNetworkCallInstant) > 2000))
        }, function() {
          onPageReady();
          
          // console.log("Last network call was made " + (new Date().getTime() - lastNetworkCallInstant)/1000 + " seconds ago");
          // console.log("Page took " + (new Date().getTime() - scriptStartInstant)/1000 + " seconds to finish");

          phantom.exit();
        });
    }
});