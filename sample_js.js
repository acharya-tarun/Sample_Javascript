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
