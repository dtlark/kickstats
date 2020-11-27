
function addComparison() {
  var x = document.getElementById("toggle_add");
  var w = document.getElementById("plus");   
  var y = document.getElementById("comp2");  
  var z = document.getElementById("comp1"); 

  if (y.style.display === "block") {
      x.style.width = "50px";
      w.style.display = "flex";
      y.style.display = "none";
      z.style.transform = "translateX(0px)";
      y.style.transform = "translateX(0px)";
      x.style.transform = "translateX(0px)";
  }
  else {
    //x.style.display = "none";
    x.style.width = "300px";
    y.style.display = "block";
    w.style.display = "none";
    z.style.transform = "translateX(-175px)";
    x.style.transform = "translateX(-175px)";

  }
}

