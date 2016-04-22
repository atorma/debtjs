window.addEventListener('load', function() {
  window.applicationCache.addEventListener('updateready', function() {
    window.location.reload();
  }, false);
}, false);