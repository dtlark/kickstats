
function addComparison() {
  var x = document.getElementById("toggle_add");
  var w = document.getElementById("plus");   
  var y = document.getElementById("comp2");  
  var z = document.getElementById("comp1"); 
  var h = document.getElementById("above"); 

  if (y.style.display === "block") {
      h.style.height = "40px";
      w.style.transform = "rotate(90deg)";
      y.style.display = "none";
      z.style.transform = "translateX(0px)";
      //y.style.transform = "translateX(-175px)";
      x.style.transform = "translateX(0px)";

  }
  else {
    h.style.height = "0px";
    w.style.transform = "rotate(0deg)";
    //x.style.display = "none";
    //x.style.width = "300px";
    y.style.display = "block";
    //w.style.display = "none";
    z.style.transform = "translateX(-145px)";
    x.style.transform = "translateX(175.5px)";

  }
}

