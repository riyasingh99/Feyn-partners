// invalidclick//
//This code includes additional checks in the canvas click event listener for the "rectangle" and "polygon" tools. If the clicked point is inside any existing polygons or rectangles, it will display an alert with the message "Invalid click!" and prevent further drawing.

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var tool = "polygon";
var clickNo = 0;
var point = [];
var polygons = [];
var rectangles = [];

// Draw polygon based on stored points
function drawPolygon() {
  if (point.length > 1) {
    ctx.beginPath();
    ctx.moveTo(point[0].x, point[0].y);
    for (var i = 1; i < point.length; i++) {
      ctx.lineTo(point[i].x, point[i].y);
    }
    ctx.closePath();
    ctx.stroke();
  }
}

// Check if final point matches the starting point
function isPolygonClosed() {
  var tolerance = 5; // Adjust the tolerance as needed
  var startPoint = point[0];
  var endPoint = point[point.length - 1];
  var dx = Math.abs(startPoint.x - endPoint.x);
  var dy = Math.abs(startPoint.y - endPoint.y);
  return dx <= tolerance && dy <= tolerance;
}

// Reset the clickNo counter and discard current points
function resetPoints() {
  clickNo = 0;
  point = [];
}

// Event listener for tool selection
document.getElementById("toolSelect").addEventListener("change", function() {
  tool = this.value;
  resetPoints();
});

// Event listener for save button
document.getElementById("saveButton").addEventListener("click", function() {
  // Code for saving the image
});

// Event listener for rectangle button
document.getElementById("rectangleButton").addEventListener("click", function() {
  tool = "rectangle";
  resetPoints();
});

// Event listener for delete button
document.getElementById("deleteButton").addEventListener("click", function() {
  tool = "delete";
  resetPoints();
});

// Check if the point is inside any existing polygon
function isInsideExistingPolygon(x, y) {
  for (var i = 0; i < polygons.length; i++) {
    if (isPointInsidePolygon(x, y, polygons[i])) {
      return true;
    }
  }
  return false;
}

// Check if the point is inside any existing rectangle
function isInsideExistingRectangle(x, y) {
  for (var i = 0; i < rectangles.length; i++) {
    if (isPointInsideRectangle(x, y, rectangles[i])) {
      return true;
    }
  }
  return false;
}

// Check if a point is inside a polygon
function isPointInsidePolygon(x, y, polygon) {
  var inside = false;
  for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    var xi = polygon[i].x;
    var yi = polygon[i].y;
    var xj = polygon[j].x;
    var yj = polygon[j].y;
    var intersect = ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Check if a point is inside a rectangle
function isPointInsideRectangle(x, y, rectangle) {
  return x > rectangle.x &&
    x < rectangle.x + rectangle.width &&
    y > rectangle.y &&
    y < rectangle.y + rectangle.height;
}

// Event listener for canvas click
canvas.addEventListener("click", function(event) {
  var rect = canvas.getBoundingClientRect();
  var mouseX = event.clientX - rect.left;
  var mouseY = event.clientY - rect.top;

  if (tool === "polygon") {
    if (isInsideExistingPolygon(mouseX, mouseY) || isInsideExistingRectangle(mouseX, mouseY)) {
      alert("Invalid click!");
      return;
    }

    if (clickNo === 0) {
      // First click
      point[0] = { x: mouseX, y: mouseY };
      clickNo = 1;
    } else if (clickNo > 0) {
      // Subsequent clicks
      point[clickNo] = { x: mouseX, y: mouseY };

      ctx.beginPath();
      ctx.moveTo(point[clickNo - 1].x, point[clickNo - 1].y);
      ctx.lineTo(point[clickNo].x, point[clickNo].y);
      ctx.stroke();
      ctx.closePath();

      // Check if polygon is closed
      if (isPolygonClosed()) {
        // Draw closed polygon
        drawPolygon();

        // Store polygon coordinates
        polygons.push([...point]);

        // Reset click counter and points
        resetPoints();
      } else {
        // Increment click counter
        clickNo++;
      }
    }
  } else if (tool === "rectangle") {
    // Code for drawing rectangles
    // ...
  } else if (tool === "delete") {
    // Code for deleting objects
    // ...
  }
});