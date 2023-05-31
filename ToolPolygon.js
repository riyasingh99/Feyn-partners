var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var tool = "line";
var clickNo = 0;
var point = [];
var polygons = [];

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

// Event listener for canvas click
canvas.addEventListener("click", function(event) {
  var rect = canvas.getBoundingClientRect();
  var mouseX = event.clientX - rect.left;
  var mouseY = event.clientY - rect.top;

  if (tool === "line") {
    // Code for drawing lines
    if (clickNo === 0) {
      point[0] = { x: mouseX, y: mouseY };
      clickNo = 1;
    } else {
      point[1] = { x: mouseX, y: mouseY };
      ctx.beginPath();
      ctx.moveTo(point[0].x, point[0].y);
      ctx.lineTo(point[1].x, point[1].y);
      ctx.stroke();
      ctx.closePath();

      // Store line coordinates
      lines.push([
        point[0].x,
        point[0].y,
        point[1].x,
        point[1].y
      ]);

      // Reset click counter
      clickNo = 0;
    }
  } else if (tool === "polygon") {
    // Code for drawing polygons
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

