<script>
  alert(location.pathname);  // /tmp/test.html
  alert(location.hostname);  // localhost
  alert(location.search);    // ?blah=2
  alert(document.URL);       // http://localhost/tmp/test.html?blah=2#foobar
  alert(location.href);      // http://localhost/tmp/test.html?blah=2#foobar
  alert(location.protocol);  // http:
  alert(location.host);      // localhost
  alert(location.origin);    // http://localhost
  alert(location.hash);      // #foobar
</script>