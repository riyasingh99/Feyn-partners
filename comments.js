// Get references to various HTML elements
const canvasDiv = document.getElementById("canvasdiv"); // Div container for the canvas
const imgImport = document.getElementById("import-img"); // Image import element
const imgFile = document.getElementById("img-file"); // File input for image upload
const imgDisp = document.getElementById("img-disp"); // Image display element
const dTool = document.getElementById("dtool"); // Drawing tool element
const freezeX = document.getElementById("freezex"); // Freeze X-axis element
const freezeY = document.getElementById("freezey"); // Freeze Y-axis element
const freeze = document.getElementById("freeze"); // Freeze canvas element
const message = document.getElementById("message"); // Message display element
const uploadPlan = document.getElementById("upload-plan"); // Plan upload button
const uploadFile = document.getElementById("upload-file"); // File input for plan upload
const drawPlan = document.getElementById("drawplan"); // Draw plan button
const firstList = document.getElementById("first-list"); // First instruction list element
const sample = document.getElementById("sample"); // Sample image element

const clearCanvas = document.querySelector("#clear-canvas"); // Clear canvas button
const saveImg = document.querySelector("#save-img"); // Save image button

const lineWidth = 1;
var lines = new Array(); // Array to store lines
var tempLines = new Array(); // Array to store temporary lines
var dashLines = new Array(); // Array to store dashed lines
var rooms = new Array(); // Array to store rooms
var newRoom = new Array(); // Array to store a new room
var clickNo = 0; // Counter for mouse clicks
var mousePos = {}; // Object to store mouse position
var tool = "polygon"; // Default drawing tool
var scale = 1; // Scale factor for zooming
var currentzoom = 1; // Current zoom level
var gridSize = 10; // Size of the grid
var originx = 0; // X-coordinate of the canvas origin
var originy = 0; // Y-coordinate of the canvas origin
var canvas2, ctx2; // Additional canvas and context variables
var point = {}; // Object to store a point
var storeyNo = 1; // Current storey number
var totalStoreys = 0; // Total number of storeys
var storeyPlanImage = new Array(); // Array to store storey plan images
var planBoundRect = {}; // Object to store plan boundary rectangle
var xBR = {}; // Object to store x-coordinates of the boundary rectangle
var yBR = {}; // Object to store y-coordinates of the boundary rectangle
var wBR = {}; // Object to store width values of the boundary rectangle
var hBR = {}; // Object to store height values of the boundary rectangle

var bldgData = {}; // Object to store building data
// bldgData['storey'] = {}
// bldgData['storey'][storeyNo] = {}
// bldgData['storey'][storeyNo]['spaces'] = {}

// Event listener for the "load" event
window.addEventListener("load", function(e){
    drawPlan.disabled = true;
    drawPlan.style.opacity = "0.5"
     // Add instructions and information as list items to the firstList element
    const li1 = document.createElement('li')
    li1.innerText = "For the sake of simplicity, we shall refer to every floor, under the ground and above the ground, as a storey"
    firstList.appendChild(li1)
    const li2 = document.createElement('li')
    li2.innerText = "We number all storeys bottoms up - 1,2... - once again, whether under the ground or above the ground"
    firstList.appendChild(li2)
    const li3 = document.createElement('li')
    li3.innerText = "For the building energy simulation, you require plan drawings for all the storeys along with information on construction materials, electrical loads, occupancy and temperature settings"
    firstList.appendChild(li3)
    const li4 = document.createElement('li')
    li4.innerText = "Plan drawing(s) can either be drawn / traced on an image of working drawing here or can be simply sketched by pen / pencil on a white background and uploaded as image"
    firstList.appendChild(li4)
    const li5 = document.createElement('li')
    li5.innerText = "If uploading plan drawing(s), it has to be ensured that they not have any text / annotations /double lines, as is shown here"
    firstList.appendChild(li5)
    const li6 = document.createElement('li')
    li6.innerText = "Double click on the image to begin"
    firstList.appendChild(li6)
})

// Event listener for the "dblclick" event on the sample element
sample.addEventListener("dblclick",function(e){
    drawPlan.disabled = false
    drawPlan.style.opacity="1"
    document.getElementById('first').style.display = "none";
})

// Create a canvas element dynamically and set its dimensions
var canvas = document.createElement('CANVAS')
canvas.id = "gridcanvas"
var ww = window.innerWidth
var wh = window.innerHeight
canvas.width = ww - 25
canvas.height = wh - 90
const ctx = canvas.getContext("2d")
// Call the drawGrid function to draw a grid on the canvas
drawGrid()
// Append the main canvas to the canvasDiv element
canvasDiv.appendChild(canvas)
// Create a second canvas element and set its dimensions
canvas2 = document.createElement("CANVAS")
canvas2.id = "drawcanvas"
canvasDiv.appendChild(canvas2)
ctx2 = canvas2.getContext("2d");
ctx2.lineWidth = lineWidth
// Hide the image display element and the info element
imgDisp.style.display = "none"
info.style.display = "none"
// Display the drawPlan button and set the default drawing tool value
drawPlan.style.display = "block"
// drawBtn.style.display = "none"
dTool.value = "polygon"
// Display the freeze canvas element
freeze.style.display = "block"
// Set the dimensions of the second canvas
canvas2.width = ww - 25
canvas2.height = wh - 90

// Event listener for the "mousemove" event on the second canvas
canvas2.addEventListener("mousemove", function(e){
     // Update the mouse position
    mousePos.x = e.offsetX
    mousePos.y = e.offsetY
    if (clickNo >= 1){
        // Clear the canvas and redraw existing lines
        dashLines.length = 0
        point[clickNo] = {'x':mousePos.x/currentzoom + originx,'y':mousePos.y/currentzoom + originy}
        ctx2.clearRect(originx,originy,15000,15000)
        // Redraw all the lines
        for(j=0;j<lines.length;j++){
            ctx2.beginPath();
            ctx2.moveTo(lines[j][0],lines[j][1]);
            ctx2.lineTo(lines[j][2],lines[j][3]);
            ctx2.stroke();
            ctx2.closePath();
        }
        if (tool == 'delete' || tool == 'rect'){
            // Draw a dashed rectangle when using delete or rectangle tool
            ctx2.setLineDash([6]);
            var rect1x = Math.min(point[0]['x'],point[1]['x'])
            var rect1y = Math.min(point[0]['y'],point[1]['y'])
            var rectw =  Math.max(point[0]['x'],point[1]['x']) - Math.min(point[0]['x'],point[1]['x'])
            var recth =  Math.max(point[0]['y'],point[1]['y']) - Math.min(point[0]['y'],point[1]['y'])
            // console.log(rect1x,rect1y,rectw,recth)
            // Draw the rectangle outline
            ctx2.strokeRect(rect1x,rect1y,rectw,recth);
            ctx2.setLineDash([]);

            // Add dashed lines to the dashLines array
            dashLines.push([point[0]['x'],point[0]['y'],point[0]['x'],point[1]['y']])
            dashLines.push([point[0]['x'],point[1]['y'],point[1]['x'],point[1]['y']])
            dashLines.push([point[1]['x'],point[1]['y'],point[1]['x'],point[0]['y']])
            dashLines.push([point[1]['x'],point[0]['y'],point[0]['x'],point[0]['y']])

        } else {
            // Redraw temporary lines and current line being drawn
            for(j=0;j<tempLines.length;j++){
                ctx2.beginPath();
                ctx2.moveTo(tempLines[j][0],tempLines[j][1]);
                ctx2.lineTo(tempLines[j][2],tempLines[j][3]);
                ctx2.stroke();
                ctx2.closePath();
            }
            ctx2.setLineDash([6]);
            ctx2.beginPath();
            ctx2.moveTo(point[clickNo-1]['x'],point[clickNo-1]['y']);
            ctx2.lineTo(point[clickNo]['x'],point[clickNo]['y']);
            ctx2.stroke();
            ctx2.closePath();
            ctx2.setLineDash([]);

            // Add the current line being drawn to the dashLines array
            dashLines.push([point[clickNo-1]['x'],point[clickNo-1]['y'],point[clickNo]['x'],point[clickNo]['y']])

        }

    }
})

// Event listener for the "change" event on the dTool element
dTool.addEventListener("change", (e) => {

    // Update the selected drawing tool
    tool = dTool.value
    console.log(tool)

    // Clear temporary lines and dashed lines
    tempLines.length = 0
    dashLines.length = 0
    if (tool == "polygon"){
         // Set the message and display the freeze canvas
        message.innerHTML = "First click sets the point of origin. Thereafter, A click draws a line between that and the last point. The final click must be on the point of origin to complete the polygon."
        freeze.style.display = "block"
        // Draw the existing lines
        draw(lines)
    } else if (tool == "rect"){
        // Draw the existing lines
        draw(lines)

        // Set the message and hide the freeze canvas
        message.innerHTML = "Click two diagonal vertices to draw a rectangle. "
        freeze.style.display = "none"
    } else if (tool == "delete"){
        // Draw the existing lines
        draw(lines)
        // Set the message and hide the freeze canvas
        message.innerHTML = "Click two diagonal vertices to delete lines inside the dashed rectangle. "
        freeze.style.display = "none"
    }
    // Reset the click counter
    clickNo = 0
    // if (tool == "delete") {
    //     clickNo = 1
    // } else {
    //     clickNo = 0
    // }
    
})

// Event listener for the "keydown" event on the document body
document.body.addEventListener("keydown", function(e){
    console.log("keydown")
    if (drawPlan.style.display == "block" && e.key == "Escape") {
        // Draw the existing lines and clear temporary lines
        draw(lines)
        tempLines.length = 0
        clickNo = 0
    }
})

// Event listener for the "click" event on the canvas2 element
canvas2.addEventListener("click", function(e){
    var ev = {}
    ev._x = e.offsetX / currentzoom + originx
    ev._y = e.offsetY / currentzoom + originy
    // console.log(ev._x,ev._y)

    // Adjust the coordinates based on the grid size
    var modX = ev._x % (gridSize);
    var modY = ev._y % (gridSize);

    ev._x=modX > gridSize / 2?ev._x + (gridSize - modX):ev._x - modX;
    ev._y=modY > gridSize / 2?ev._y + (gridSize - modY):ev._y - modY;

     // Check if the clicked point is close to an existing line's vertices

    for(i=0;i<lines.length;i++){
        if(Math.abs(lines[i][0]-ev._x) < gridSize && Math.abs(lines[i][1]-ev._y) < gridSize){
            ev._x = lines[i][0]
            ev._y = lines[i][1]
        } else if(Math.abs(lines[i][2]-ev._x) < gridSize && Math.abs(lines[i][3]-ev._y) < gridSize){
            ev._x = lines[i][2]
            ev._y = lines[i][3]
        }
    }
    // console.log(ev._x,ev._y)
    let inside = false
    console.log(rooms, clickNo, tool)
    if(tool !="delete"){
        // Check if the clicked point is inside any of the rooms
        for(u=0;u<rooms.length;u++){
            let pt = new Point(ev._x,ev._y)
            if(!checkInside(rooms[u],rooms[u].length,pt)){

                inside = false
                console.log("not inside")
                // clickNo = clickNo - 1
                // break
            } else {
                inside = true
                console.log("inside")
                break
            }
        }
    }

    if (!inside){
        if (clickNo == 0){
            // Set the initial point of the line
            point = {}
            point[0] = {'x':ev._x,'y':ev._y}
            clickNo = 1
            console.log(point)
        } else {
            if (tool == "polygon"){
                // Adjust the clicked point based on freeze options
                if(freezeX.checked){
                    ev._y = point[clickNo-1]['y']
                }
                if(freezeY.checked){
                    ev._x = point[clickNo-1]['x']
                }
                // Set the clicked point as the next point in the polygon
                point[clickNo] = {'x':ev._x,'y':ev._y}
                console.log(point)
                let intersect = false
                let ll1 = new Line( new Point(point[clickNo-1]['x'], point[clickNo-1]['y']), new Point(point[clickNo]['x'], point[clickNo]['y']))

                // Check for intersections between the new line and existing lines
                for(x=0;x<lines.length;x++){
    
                    let ll2 = new Line( new Point(lines[x][0],lines[x][1]), new Point(lines[x][2],lines[x][3]))
                    if (isIntersect(ll1,ll2)){
                        intersect = true
                        console.log("intersects",ll1,ll2)
                        // break
                    }
                }
                // let repLine = false
                // for(x=0;x<tempLines.length;x++){
                //     let ll3 = new Line( new Point(tempLines[x][0],tempLines[x][1]), new Point(tempLines[x][2],tempLines[x][3]))
                //     if(onLine(ll3,new Point(point[clickNo-1]['x'], point[clickNo-1]['y'])) && onLine(ll3,new Point(point[clickNo]['x'], point[clickNo]['y']))){
                //         repLine = true
                //         break
                //     }
                // }
                let ll3 = new Line(new Point(point[clickNo-1]['x'], point[clickNo-1]['y']),new Point(point[clickNo]['x'], point[clickNo]['y']))
                if (!intersect && !isSliding(ll3)){
                     // If the line does not intersect with any existing lines and does not slide along any existing lines
                    draw(lines)
                    tDraw(tempLines)
                    // Draw the line on the canvas
                    ctx2.beginPath();
                    ctx2.moveTo(point[clickNo-1]['x'], point[clickNo-1]['y']);
                    ctx2.lineTo(point[clickNo]['x'], point[clickNo]['y']);
                    ctx2.stroke();
                    // console.log('stroked')
                    ctx2.closePath();
                    // Add the line to tempLines
                    tempLines.push([point[clickNo-1]['x'], point[clickNo-1]['y'],point[clickNo]['x'], point[clickNo]['y']])
                    if (clickNo > 1 && point[clickNo]['x'] == point[0]['x'] && point[clickNo]['y'] == point[0]['y'] ){
                        // If the current point coincides with the initial point and click number is greater than 1, a polygon is completed
                        console.log("done")
                        tempLines.length = 0
                        let roomPoly = [new Point(point[0]['x'], point[0]['y'] )]

                        // Create a polygon from the clicked points
                        for(n=1;n<clickNo;n++){
                            if (n != clickNo){
                                roomPoly.push(new Point(point[n]['x'], point[n]['y']))
                            }
                        }
                        if(!isEnclosing(roomPoly)){
                            // If the completed polygon is not enclosing
                            for(n=1;n<clickNo+1;n++){
                                lines.push([point[n-1]['x'], point[n-1]['y'],point[n]['x'], point[n]['y']])    
                            }
                            rooms.push(roomPoly)
                        }
                        draw(lines)
                        clickNo = 0
                    } else {
                        clickNo = clickNo + 1
                    }
                    
                }             
    
    
            } else if (tool == "rect"){
                point[1] = {'x':ev._x,'y':ev._y}
                console.log(point)

                // Calculate rectangle coordinates
                var rect1x = Math.min(point[0]['x'],point[1]['x'])
                var rect1y = Math.min(point[0]['y'],point[1]['y'])
                var rectw =  Math.max(point[0]['x'],point[1]['x']) - Math.min(point[0]['x'],point[1]['x'])
                var recth =  Math.max(point[0]['y'],point[1]['y']) - Math.min(point[0]['y'],point[1]['y'])
                // console.log(rect1x,rect1y,rectw,recth)
                let intersect = false
                let ll1 = new Line( new Point(point[clickNo-1]['x'], point[clickNo-1]['y']), new Point(point[clickNo-1]['x'], point[clickNo]['y']))
                let ll2 = new Line( new Point(point[clickNo-1]['x'], point[clickNo]['y']), new Point(point[clickNo]['x'], point[clickNo]['y']))
                let ll3 = new Line( new Point(point[clickNo]['x'], point[clickNo]['y']), new Point(point[clickNo]['x'], point[clickNo-1]['y']))
                let ll4 = new Line( new Point(point[clickNo]['x'], point[clickNo-1]['y']), new Point(point[clickNo-1]['x'], point[clickNo-1]['y']))
    
                for(x=0;x<lines.length;x++){
    
                    let ll5 = new Line( new Point(lines[x][0],lines[x][1]), new Point(lines[x][2],lines[x][3]))
                    if (isIntersect(ll1,ll5) || isIntersect(ll2,ll5) || isIntersect(ll3,ll5) || isIntersect(ll4,ll5)){
                        intersect = true
                        // console.log("intersects",isIntersect(ll1,ll5),isIntersect(ll2,ll5),isIntersect(ll3,ll5),isIntersect(ll4,ll5),ll1,ll2,ll3,ll4,ll5)
                        // break
                    }
                }
                newRoom = [new Point(point[0]['x'], point[0]['y'] ), new Point(point[0]['x'], point[1]['y'] ), new Point(point[1]['x'], point[1]['y'] ), new Point(point[1]['x'], point[0]['y'])]
                if(!intersect && !isEnclosing(newRoom)){
                    // ctx2.strokeRect(rect1x,rect1y,rectw,recth);

                    // Add four lines representing the rectangle to lines array
                    lines.push([point[0]['x'],point[0]['y'],point[0]['x'],point[1]['y']])
                    lines.push([point[0]['x'],point[1]['y'],point[1]['x'],point[1]['y']])
                    lines.push([point[1]['x'],point[1]['y'],point[1]['x'],point[0]['y']])
                    lines.push([point[1]['x'],point[0]['y'],point[0]['x'],point[0]['y']])
                    draw(lines)
                    rooms.push(newRoom)
                    console.log("rect drawn", rooms)
                    clickNo = 0
                }
                // clickNo = 0
            
            } else if (tool == "delete") {
                point[1] = {'x':ev._x,'y':ev._y}
    
                let polygon= [ new Point(point[0]['x'], point[0]['y'] ), new Point(point[0]['x'], point[1]['y'] ), new Point(point[1]['x'], point[1]['y'] ), new Point(point[1]['x'], point[0]['y']) ];
    
                let n = 4;
                for(i=0;i<lines.length;i++){
                    let p = new Point( lines[i][0],lines[i][1]);
                    let q = new Point( lines[i][2],lines[i][3] );
                    if (checkInside(polygon,n,p) && checkInside(polygon,n,q)){
                        lines.splice(i,1)
                        // console.log(lines)
                    }
                }
                 // Clear the canvas
                ctx2.clearRect(0,0,canvas2.width,canvas2.height)
                // Redraw the remaining lines
                for(j=0;j<lines.length;j++){
                    ctx2.beginPath();
                    ctx2.moveTo(lines[j][0],lines[j][1]);
                    ctx2.lineTo(lines[j][2],lines[j][3]);
                    ctx2.stroke();
                    ctx2.closePath();
                }
                clickNo = 0;
            }  
        }

    }

});

canvas2.addEventListener("wheel", function(event){
    // Calculate the wheel movement
    var wheel = event.wheelDelta/120;//n or -n
    var zoom = 0;

    // Determine the zoom factor based on the wheel movement
    if(wheel < 0)
    {
        zoom = 1/1.1;// Zoom out
    }
    else
    {
        zoom = 1.1;// Zoom in
    }

    // Get the current mouse position
    mousex = mousePos.x
    mousey = mousePos.y

    // Update the zoom level
    currentzoom *= zoom;
    // Translate the canvas to adjust the origin
    ctx2.translate(
        originx,
        originy
    );      
    // Scale the canvas to apply zoom
    ctx2.scale(zoom,zoom);
    // Adjust the canvas translation to keep the mouse position centered
    ctx2.translate(
        -( mousex / scale + originx - mousex / ( scale * zoom ) ),
        -( mousey / scale + originy - mousey / ( scale * zoom ) )
    );
    // Update the origin coordinates
    originx = ( mousex / scale + originx - mousex / ( scale * zoom ) );
    originy = ( mousey / scale + originy - mousey / ( scale * zoom ) );
     // Update the scale factor
    scale *= zoom;
    // Adjusting the grid canvas
    // gridSize *= zoom;
    // Adjust the size of the image container
    var imageWidth = parseFloat(imgDisp.style.width.split("v")[0]);
    imgDisp.style.width = imageWidth * zoom + "vw";


    // Redraw the lines and temporary lines
    draw(lines)
    tDraw(tempLines)
    dDraw(dashLines)
    // drawGrid()
});

// Function to draw lines
function draw(llines){
    console.log(canvas2.width,currentzoom)
    ctx2.clearRect(originx,originy,15000,15000)

    // Iterate over the lines and draw each one
    for(j=0;j<llines.length;j++){
        ctx2.beginPath();
        ctx2.moveTo(llines[j][0],llines[j][1]);
        ctx2.lineTo(llines[j][2],llines[j][3]);
        ctx2.stroke();
        ctx2.closePath();
    }
}

// Function to draw temporary lines
function tDraw(llines){
    console.log(canvas2.width,currentzoom)
    // ctx2.clearRect(originx,originy,15000,15000)
    // Iterate over the temporary lines and draw each one
    for(j=0;j<llines.length;j++){
        ctx2.beginPath();
        ctx2.moveTo(llines[j][0],llines[j][1]);
        ctx2.lineTo(llines[j][2],llines[j][3]);
        ctx2.stroke();
        ctx2.closePath();
    }
}

 // Function to draw dashed lines
function dDraw(llines){
    console.log(canvas2.width,currentzoom)
    // ctx2.clearRect(originx,originy,15000,15000)
    // Set the line dash pattern
    ctx2.setLineDash([6]);
    for(j=0;j<llines.length;j++){
        ctx2.beginPath();
        ctx2.moveTo(llines[j][0],llines[j][1]);
        ctx2.lineTo(llines[j][2],llines[j][3]);
        ctx2.stroke();
        ctx2.closePath();
    }
    // Reset the line dash pattern
    ctx2.setLineDash([]);
}

// Function to draw the grid
function drawGrid(){
    ctx.clearRect(originx,originy,15000,15000)
     // Iterate over the canvas width and height with the grid size interval
    for (var i=gridSize; i<canvas.width; i += gridSize) {
        for (var j = gridSize; j < canvas.height; j += gridSize) {
    
            ctx.beginPath();
            ctx.arc(i, j, 0.5, 0, 2 * Math.PI);
            ctx.fillStyle= "#FF6600";
            ctx.fill();
            ctx.closePath();
        }
    }
}

// Event listener for image import button click
imgImport.addEventListener('click', (e) => {
    imgFile.click(); // Trigger the file input click event
})

// Function to display selected image
const dispImg = (event) => {
    const imageFiles = event.target.files;

    const imageFilesLength = imageFiles.length;

    if (imageFilesLength > 0) {
        // Get the source URL of the selected image

        const imageSrc = URL.createObjectURL(imageFiles[0]);
        // Display the image in the imgDisp element
        imgDisp.src = imageSrc;
        imgDisp.style.display = "block";
    }
};

// Event listener for clear canvas button click
clearCanvas.addEventListener("click", () => {
    // const ctx2 = document.getElementById('drawcanvas').getContext("2d");
    ctx2.clearRect(0, 0, document.getElementById('drawcanvas').width, document.getElementById('drawcanvas').height); // clearing whole canvas
    // lines = []
    lines.length = 0          // Clear the lines array
    tempLines.length = 0      // Clear the temporary lines array
    clickNo = 0               // Reset the click counter
});

// Event listener for save image button click
saveImg.addEventListener("click", () => {
    // Draw the lines on the canvas
    draw(lines)

     // Set the global composite operation to 'destination-over' to place the filled rectangle behind the drawing
    ctx2.globalCompositeOperation = 'destination-over';
    ctx2.fillStyle = 'white';
     // Fill a white rectangle over the canvas to create a blank background
    ctx2.fillRect(0, 0, document.getElementById('drawcanvas').width, document.getElementById('drawcanvas').height);
    // Create a download link for the image
    const link = document.createElement("a"); 
    link.download = 'Storey ' + storeyNo +'.jpg'; // Set the download filename
    link.href = document.getElementById('drawcanvas').toDataURL();// Set the link URL to the canvas image data
    link.click(); // Trigger the click event to download the image

    var img = new Image();
    img.src = document.getElementById('drawcanvas').toDataURL();
    img.onload =  function() {
        // img.src = reader.result;
        // var imageD = (img.src).split(",")[1]
        // sessionStorage["imagedata"] = imageD
        storeyPlanImage[storeyNo] = document.getElementById('drawcanvas').toDataURL()
        generateContour(document.getElementById('drawcanvas').toDataURL());
    }
    // img.src = document.getElementById('drawcanvas').toDataURL();
    // img.onerror = console.error("The provided file couldn't be loaded");

});

// Event listener for upload plan button click
uploadPlan.addEventListener("click",()=> {
    document.getElementById("upload-file").click();
})
// Event listener for file upload change
uploadFile.addEventListener("change", (e) => {
    var file = e.target.files[0];
    var reader = new FileReader();
     // Read the uploaded file
    reader.onload = (e)=>{
        storeyPlanImage[storeyNo] = reader.result; // Save the uploaded image data
        generateContour(reader.result); // Generate contour using the uploaded image data
        uploadFile.value = null; // Reset the file input value
    }
    reader.readAsDataURL(file);
})

// Function to generate contour based on the storey plan
function generateContour(storeyPlan){
    var id = "pic" + storeyNo
      // Create a FormData object and append the storey plan image data
    var planData = new FormData()
    planData.append(id,dataURLToBlob(storeyPlan))
    planData.append('purpose',"contour")
     // Send a POST request with the storey plan data
    fetch("/", {
        method: 'post',
        body: planData
    })
        .then(res => res.json())
            .then(data => {
                console.log(data)
                var xPoints = []
                var yPoints = []
                // Iterate over the contour data
                for (key in data){
                    for (var l=0;l<data[key].length;l++){
                        xPoints.push(data[key][l][0])
                        yPoints.push(data[key][l][1])
                    }

                    // Calculate the bounding rectangle for the plan
                    planBoundRect[storeyNo] = {}
                    planBoundRect[storeyNo]['x'] = [Math.min.apply(null,xPoints), Math.max.apply(null,xPoints)]
                    planBoundRect[storeyNo]['y'] = [Math.min.apply(null,yPoints), Math.max.apply(null,yPoints)]

                    // Store the bounding rectangle values
                    xBR[storeyNo] = planBoundRect[storeyNo]['x'][0]
                    yBR[storeyNo] = planBoundRect[storeyNo]['y'][0]
                    wBR[storeyNo] = planBoundRect[storeyNo]['x'][1] - planBoundRect[storeyNo]['x'][0]
                    hBR[storeyNo] = planBoundRect[storeyNo]['y'][1] - planBoundRect[storeyNo]['y'][0]

                    // Initialize the necessary data structures in bldgData
                    if (!('storey' in bldgData)){
                        bldgData['storey'] = {}
                    }
                    if (!(storeyNo in bldgData['storey'])){
                        bldgData['storey'][storeyNo] = {}
                    }
                    if (!('spaces' in bldgData['storey'][storeyNo])){
                        bldgData['storey'][storeyNo]['spaces'] = {}
                    }
                    if (!(key in bldgData['storey'][storeyNo]['spaces'])){
                        bldgData['storey'][storeyNo]['spaces'][key] = {}
                    }
                    if (!('storeymat' in bldgData['storey'][storeyNo]['spaces'][key])){
                        bldgData['storey'][storeyNo]['spaces'][key]['storeymat'] = {}
                    }
                    if (!('occ' in bldgData['storey'][storeyNo]['spaces'][key])){
                        bldgData['storey'][storeyNo]['spaces'][key]['occ'] = {}
                    }
                    if (!('load' in bldgData['storey'][storeyNo]['spaces'][key])){
                        bldgData['storey'][storeyNo]['spaces'][key]['load'] = {}
                    }
                    if (!('temp' in bldgData['storey'][storeyNo]['spaces'][key])){
                        bldgData['storey'][storeyNo]['spaces'][key]['temp'] = {}
                    }


                    // bldgData['storey'][storeyNo]['spaces'][key] = {}
                    // bldgData['storey'][storeyNo]['spaces'][key]['storeymat'] = {}
                     // Set the default values for storey materials in bldgData
                    bldgData['storey'][storeyNo]['spaces'][key]['storeymat']['Roof Material'] = matData[0]
                    bldgData['storey'][storeyNo]['spaces'][key]['storeymat']['Ceiling Material'] = matData[0]
                    bldgData['storey'][storeyNo]['spaces'][key]['storeymat']['Exterior Wall Material'] = matData[0]
                    bldgData['storey'][storeyNo]['spaces'][key]['storeymat']['Interior Wall Material'] = matData[0]
                    bldgData['storey'][storeyNo]['spaces'][key]['storeymat']['Floor Material'] = matData[0]
                    // bldgData['storey'][storeyNo]['spaces'][key]['occ'] = {}
                    // bldgData['storey'][storeyNo]['spaces'][key]['load'] = {}
                    // bldgData['storey'][storeyNo]['spaces'][key]['temp'] = {}
                    bldgData['storey'][storeyNo]['spaces'][key]["coords"] = data[key]
                     // Set the default values for occupancy, load, and temperature in bldgData
                    for (x=1;x<25;x++){
                        var o = "occ-"+x
                        var l = "load-"+x
                        var t = "temp-"+x
                        bldgData["storey"][storeyNo]["spaces"][key]['occ'][o] = rangeData['occ'][0]
                        bldgData["storey"][storeyNo]["spaces"][key]['load'][l] = rangeData['load'][0]
                        bldgData["storey"][storeyNo]["spaces"][key]['temp'][t] = rangeData['temp'][0]
                    }
                    
                }
                console.log(bldgData)
                // Store the space data in sessionStorage
                sessionStorage['spaces'+"-"+storeyNo] = JSON.stringify(data)
                // Display relevant information and elements
                info.style.display = "block"
                // spaceInfo.style.display = "block"
                // console.log(storeyNo,numStorey.value)
                // if(storeyNo == parseInt(numStorey.value)){
                //     nextStorey.style.display = "none"
                //     submit.style.display = "block"
                // }
                // submit.style.display = "block"
                // if (document.getElementById("comptable")){
                //     document.getElementById("comptable").style.display = "block"
                // }
                clearCanvas.click();
                drawPlan.style.display = "none"
                // document.getElementById('drawcanvas').remove();
                divFloor.style.display = "block"



                
                storSize.innerText = "Size of Storey " + storeyNo + " bounding rectangle (red-dashed)"
                done.style.display = "block"
                if (storeyNo == 1){
                    divBldg.style.display = "block"
                } else if (!('basement' in bldgData["storey"][storeyNo-1] )){
                    document.getElementById('basement').style.display = "none";
                }
                // else {
                //     storOffset.style.display = "block"
                // }
                // if (storeyNo > 2){
                //     sameChk.style.display = "block"
                // }

                canvasPlan(storeyPlan,data,id)
            })
}

// Function to check if a point lies on a line segment
function isPointOnLine(px, py, x1, y1, x2, y2, width) {

    return distancePointFromLine(px, py, x1, y1, x2, y2) <= width / 2
    // return distancePointFromLine(px, py, x1, y1, x2, y2) <= 25
}
  
// Function to calculate the distance between a point and a line segment
function distancePointFromLine(x0, y0, x1, y1, x2, y2) {
    return Math.abs((x2 - x1) * (y1 - y0) - (x1 - x0) * (y2 - y1)) / Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

 // Event listener to toggle the freeze options
function togRad(e){
    var ele = e.target
    if(ele.id == "freezex" && freezeY.checked ){
        freezeY.checked = false
    }
    if(ele.id == "freezey" && freezeX.checked ){
        freezeX.checked = false
    }
}

 // Function to convert a data URL to a Blob object
var dataURLToBlob = function(dataURL) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = parts[1];

        return new Blob([raw], {type: contentType});
    }

    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type: contentType});
}
 // Class definitions for Point and Line
class Point {
	//int x, y;
	constructor(x,y)
	{
		this.x=x;
		this.y=y;
	}
}

class Line {
	//Point p1, p2;
	constructor(p1,p2)
	{
		this.p1=p1;
		this.p2=p2;
	}

};

function onLine(l1, p)
{
	// Check whether p is on the line or not
	if (p.x <= Math.max(l1.p1.x, l1.p2.x)
		&& p.x >= Math.min(l1.p1.x, l1.p2.x)
		&& (p.y <= Math.max(l1.p1.y, l1.p2.y)
			&& p.y >= Math.min(l1.p1.y, l1.p2.y)))
		return true;

	return false;
}

function direction(a, b, c)
{// Calculate the direction of three points (collinear, clockwise, or anti-clockwise)
	let val = (b.y - a.y) * (c.x - b.x)
			- (b.x - a.x) * (c.y - b.y);

	if (val == 0)

		// Collinear
		return 0;

	else if (val < 0)

		// Anti-clockwise direction
		return 2;

	// Clockwise direction
	return 1;
}

function isIntersect(l1, l2)
{
	// Four direction for two lines and points of other line
	let dir1 = direction(l1.p1, l1.p2, l2.p1);
	let dir2 = direction(l1.p1, l1.p2, l2.p2);
	let dir3 = direction(l2.p1, l2.p2, l1.p1);
	let dir4 = direction(l2.p1, l2.p2, l1.p2);
    // console.log(dir1,dir2,dir3,dir4)

	// When p2 of line2 are on the line1
    // console.log(onLine(l1, l2.p1), l1,l2.p1)
	if (dir1 == 0 && onLine(l1, l2.p1))
		// return true;
        return false;

	// When p1 of line2 are on the line1
    // console.log(onLine(l1, l2.p2),l1,l2.p2)
	if (dir2 == 0 && onLine(l1, l2.p2))
		// return true;
        return false;

	// When p2 of line1 are on the line2
    // console.log(onLine(l2, l1.p1),l2,l1.p1)
	if (dir3 == 0 && onLine(l2, l1.p1))
		// return true;
        return false;

	// When p1 of line1 are on the line2
    // console.log(onLine(l2, l1.p2),l2,l1.p2)
	if (dir4 == 0 && onLine(l2, l1.p2))
		// return true;
        return false;

	// When intersecting
	if (dir1 != dir2 && dir3 != dir4)
		return true;

	return false;
}

function checkInside(poly, n, p)
{

	// When polygon has less than 3 edge, it is not polygon
	if (n < 3)
		return false;

	// Create a point at infinity, y is same as point p
	let tmp=new Point(9999, p.y);
	let exline = new Line( p, tmp );
	let count = 0;
	let i = 0;
	do {

		// Forming a line from two consecutive points of
		// poly
		let side = new Line( poly[i], poly[(i + 1) % n] );
		if (isIntersect(side, exline)) {
            // console.log("intersects", side)
			// If side is intersects exline
			if (direction(side.p1, p, side.p2) == 0)
				return !onLine(side, p);
			count++;
		}
		i = (i + 1) % n;
	} while (i != 0);

	// When count is odd, the point is inside the polygon
	return count & 1;
}

function isEnclosing(outPol){
    // Check if the outer polygon encloses all the rooms
    for(x=0;x<rooms.length;x++){
        var c = 0
        for(y=0;y<rooms[x].length;y++){
            if(checkInside(outPol,outPol.length,rooms[x][y])){
                c = c + 1
            }
        }
        if(c==rooms[x].length){
            return true
        }
    }
    return false
}

function isSliding(lline){
     // Check if the line is sliding on any temporary lines
    for(x=0;x<tempLines.length;x++){
        var l = new Line( new Point(tempLines[x][0],tempLines[x][1]), new Point(tempLines[x][2],tempLines[x][3]))
        if((onLine(l,lline.p1) && onLine(l,lline.p2)) || (onLine(lline,l.p1) && onLine(lline,l.p2))){
            return true
        }
    }
    return false
}

