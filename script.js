document.querySelectorAll('.nocopy').forEach(function(el){

  el.addEventListener('copy', function(e){
    e.preventDefault();
  });

  el.addEventListener('cut', function(e){
    e.preventDefault();
  });

  el.addEventListener('contextmenu', function(e){
    e.preventDefault();
  });

});
