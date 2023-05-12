const canvasDiv = document.getElementById("canvasdiv")
const imgImport = document.getElementById("import-img")
const imgFile = document.getElementById("img-file")
const imgDisp = document.getElementById("img-disp")
const dTool = document.getElementById("dtool")
const freezeX = document.getElementById("freezex")
const freezeY = document.getElementById("freezey")
const freeze = document.getElementById("freeze")
const message = document.getElementById("message")
const uploadPlan = document.getElementById("upload-plan")
const uploadFile = document.getElementById("upload-file")
const drawPlan = document.getElementById("drawplan")
const firstList = document.getElementById("first-list")
const sample = document.getElementById("sample")


const clearCanvas = document.querySelector("#clear-canvas")
const saveImg = document.querySelector("#save-img")

const lineWidth = 1 
var lines = new Array
var clickNo = 0;
var mousePos = {}
var tool = "line"
var scale = 1;
var currentzoom = 1;
const gridSize = 10
var originx = 0;
var originy = 0;
var canvas2, ctx2
var point = {};
var storeyNo = 1
var totalStoreys = 0
var storeyPlanImage = new Array
var planBoundRect = {}
var xBR = {}
var yBR = {}
var wBR = {}
var hBR = {}

var bldgData = {}
// bldgData['storey'] = {}
// bldgData['storey'][storeyNo] = {}
// bldgData['storey'][storeyNo]['spaces'] = {}

window.addEventListener("load", function(e){
    drawPlan.disabled = true;
    drawPlan.style.opacity = "0.5"
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

sample.addEventListener("dblclick",function(e){
    drawPlan.disabled = false
    drawPlan.style.opacity="1"
    document.getElementById('first').style.display = "none";
})

var canvas = document.createElement('CANVAS')
canvas.id = "gridcanvas"
var ww = window.innerWidth
var wh = window.innerHeight
canvas.width = ww - 25
canvas.height = wh - 90
const ctx = canvas.getContext("2d")

for (var i=gridSize; i<canvas.width; i += gridSize) {
    for (var j = gridSize; j < canvas.height; j += gridSize) {

        ctx.beginPath();
        ctx.arc(i, j, 0.5, 0, 2 * Math.PI);
        ctx.fillStyle= "#FF6600";
        ctx.fill();
        ctx.closePath();
    }
}
canvasDiv.appendChild(canvas)
canvas2 = document.createElement("CANVAS")
canvas2.id = "drawcanvas"
canvasDiv.appendChild(canvas2)
ctx2 = canvas2.getContext("2d");
ctx2.lineWidth = lineWidth
imgDisp.style.display = "none"
info.style.display = "none"
drawPlan.style.display = "block"
// drawBtn.style.display = "none"
dTool.value = "line"
freeze.style.display = "block"
canvas2.width = ww - 25
canvas2.height = wh - 90
canvas2.addEventListener("mousemove", function(e){
    mousePos.x = e.offsetX
    mousePos.y = e.offsetY
    if (tool == "delete" && clickNo == 1) {
        point[1] = {'x':mousePos.x/currentzoom + originx,'y':mousePos.y/currentzoom + originy}
        ctx2.clearRect(0,0,canvas2.width,canvas2.height)
        for(j=0;j<lines.length;j++){
            ctx2.beginPath();
            ctx2.moveTo(lines[j][0],lines[j][1]);
            ctx2.lineTo(lines[j][2],lines[j][3]);
            ctx2.stroke();
            ctx2.closePath();
        }
        ctx2.setLineDash([6]);
        var rect1x = Math.min(point[0]['x'],point[1]['x'])
        var rect1y = Math.min(point[0]['y'],point[1]['y'])
        var rectw =  Math.max(point[0]['x'],point[1]['x']) - Math.min(point[0]['x'],point[1]['x'])
        var recth =  Math.max(point[0]['y'],point[1]['y']) - Math.min(point[0]['y'],point[1]['y'])
        // console.log(rect1x,rect1y,rectw,recth)
        ctx2.strokeRect(rect1x,rect1y,rectw,recth);
        ctx2.setLineDash([]);
    } 
})
dTool.addEventListener("change", (e) => {
    tool = dTool.value
    console.log(tool)
    if (tool == "line"){
        message.innerHTML = "First click sets the point of origin. Thereafter, A click draws a line between that and the last point."
        freeze.style.display = "block"
    } else if (tool == "rect"){
        message.innerHTML = "Click two diagonal vertices to draw a rectangle. "
        freeze.style.display = "none"
    } else if (tool == "delete"){
        message.innerHTML = "Click two diagonal vertices to delete lines inside the dashed rectangle. "
        freeze.style.display = "none"
    }
    clickNo = 0
    // if (tool == "delete") {
    //     clickNo = 1
    // } else {
    //     clickNo = 0
    // }
    
})

canvas2.addEventListener("click", function(e){
    var ev = {}
    ev._x = e.offsetX / currentzoom + originx
    ev._y = e.offsetY / currentzoom + originy
    // console.log(ev._x,ev._y)
    var modX = ev._x % (gridSize);
    var modY = ev._y % (gridSize);

    ev._x=modX > gridSize / 2?ev._x + (gridSize - modX):ev._x - modX;
    ev._y=modY > gridSize / 2?ev._y + (gridSize - modY):ev._y - modY;

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
    
    if (clickNo == 0){
        point[0] = {'x':ev._x,'y':ev._y}
        clickNo = 1
        console.log(point)
    } else {
        if (tool == "line"){
            if(freezeX.checked){
                ev._y = point[clickNo-1]['y']
            }
            if(freezeY.checked){
                ev._x = point[clickNo-1]['x']
            }
            point[clickNo] = {'x':ev._x,'y':ev._y}
            console.log(point)                
            ctx2.beginPath();
            ctx2.moveTo(point[clickNo-1]['x'], point[clickNo-1]['y']);
            ctx2.lineTo(point[clickNo]['x'], point[clickNo]['y']);
            ctx2.stroke();
            ctx2.closePath();
            lines.push([point[clickNo-1]['x'], point[clickNo-1]['y'],point[clickNo]['x'], point[clickNo]['y']])
            clickNo = clickNo + 1
        } else if (tool == "rect"){
            point[1] = {'x':ev._x,'y':ev._y}
            console.log(point)
            var rect1x = Math.min(point[0]['x'],point[1]['x'])
            var rect1y = Math.min(point[0]['y'],point[1]['y'])
            var rectw =  Math.max(point[0]['x'],point[1]['x']) - Math.min(point[0]['x'],point[1]['x'])
            var recth =  Math.max(point[0]['y'],point[1]['y']) - Math.min(point[0]['y'],point[1]['y'])
            // console.log(rect1x,rect1y,rectw,recth)
            ctx2.strokeRect(rect1x,rect1y,rectw,recth);
            lines.push([point[0]['x'],point[0]['y'],point[0]['x'],point[1]['y']])
            lines.push([point[0]['x'],point[1]['y'],point[1]['x'],point[1]['y']])
            lines.push([point[1]['x'],point[1]['y'],point[1]['x'],point[0]['y']])
            lines.push([point[1]['x'],point[0]['y'],point[0]['x'],point[0]['y']])
            clickNo = 0
        
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
            ctx2.clearRect(0,0,canvas2.width,canvas2.height)
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
});

// Event listener for the wheel event
canvas2.addEventListener("wheel", function(event) {
    var wheel = event.wheelDelta / 120; // n or -n
    var zoom = 0;
    if (wheel < 0) {
      zoom = 1 / 1.1;
    } else {
      zoom = 1.1;
    }
  
    mousex = mousePos.x;
    mousey = mousePos.y;
    currentzoom *= zoom;
    
    // Adjusting the drawing canvas
    ctx2.translate(originx, originy);
    ctx2.scale(zoom, zoom);
    ctx2.translate(
      -(mousex / scale + originx - mousex / (scale * zoom)),
      -(mousey / scale + originy - mousey / (scale * zoom))
    );
    originx = mousex / scale + originx - mousex / (scale * zoom);
    originy = mousey / scale + originy - mousey / (scale * zoom);
    scale *= zoom;
  
    // Adjusting the grid canvas
    gridSize *= zoom;
  
    // Redraw the drawing canvas and the grid canvas
    draw();
    drawGrid();
  });
  
  // Function to draw lines on the drawing canvas
  function draw() {
    console.log(canvas2.width, currentzoom);
    ctx2.clearRect(originx, originy, 15000, 15000);
    
    for (j = 0; j < lines.length; j++) {
      ctx2.beginPath();
      ctx2.moveTo(lines[j][0], lines[j][1]);
      ctx2.lineTo(lines[j][2], lines[j][3]);
      ctx2.stroke();
      ctx2.closePath();
    }
  }
  
  // Function to draw the grid on the grid canvas
  function drawGrid() {
    gridCanvas.width = ww - 25;
    gridCanvas.height = wh - 90;
  
    for (var i = gridSize; i < gridCanvas.width; i += gridSize) {
      for (var j = gridSize; j < gridCanvas.height; j += gridSize) {
        ctxGrid.beginPath();
        ctxGrid.arc(i, j, 0.5, 0, 2 * Math.PI);
        ctxGrid.fillStyle = "#FF6600";
        ctxGrid.fill();
        ctxGrid.closePath();
      }
    }
  }
  
  // Adjusting the size of the image based on the zoom factor
  var image = document.getElementById("yourImageId");
  var imageWidth = parseFloat(image.style.width.split("v")[0]);
  image.style.width = imageWidth * zoom + "vw";
  
// function ddraw() {
//     for(j=0;j<lines.length;j++){
//         ctx2.beginPath();
//         ctx2.moveTo(lines[j][0],lines[j][1]);
//         ctx2.lineTo(lines[j][2],lines[j][3]);
//         ctx2.stroke();
//         ctx2.closePath();
//     }
// }

imgImport.addEventListener('click', (e) => {
    imgFile.click();
})

const dispImg = (event) => {
    const imageFiles = event.target.files;

    const imageFilesLength = imageFiles.length;

    if (imageFilesLength > 0) {

        const imageSrc = URL.createObjectURL(imageFiles[0]);
        imgDisp.src = imageSrc;
        imgDisp.style.display = "block";
    }
};

clearCanvas.addEventListener("click", () => {
    // const ctx2 = document.getElementById('drawcanvas').getContext("2d");
    ctx2.clearRect(0, 0, document.getElementById('drawcanvas').width, document.getElementById('drawcanvas').height); // clearing whole canvas
    // lines = []
    lines.length = 0
    clickNo = 0
});

saveImg.addEventListener("click", () => {
    ctx2.globalCompositeOperation = 'destination-over';
    ctx2.fillStyle = 'white';
    ctx2.fillRect(0, 0, document.getElementById('drawcanvas').width, document.getElementById('drawcanvas').height);
    const link = document.createElement("a"); 
    link.download = 'Storey ' + storeyNo +'.jpg'; 
    link.href = document.getElementById('drawcanvas').toDataURL();
    link.click(); // clicking link to download image
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

uploadPlan.addEventListener("click",()=> {
    document.getElementById("upload-file").click();
})
uploadFile.addEventListener("change", (e) => {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = (e)=>{
        storeyPlanImage[storeyNo] = reader.result
        generateContour(reader.result);
        uploadFile.value = null;
    }
    reader.readAsDataURL(file);
})


function generateContour(storeyPlan){
    var id = "pic" + storeyNo
    var planData = new FormData()
    planData.append(id,dataURLToBlob(storeyPlan))
    planData.append('purpose',"contour")
    fetch("/", {
        method: 'post',
        body: planData
    })
        .then(res => res.json())
            .then(data => {
                console.log(data)
                var xPoints = []
                var yPoints = []
                for (key in data){
                    for (var l=0;l<data[key].length;l++){
                        xPoints.push(data[key][l][0])
                        yPoints.push(data[key][l][1])
                    }
                    planBoundRect[storeyNo] = {}
                    planBoundRect[storeyNo]['x'] = [Math.min.apply(null,xPoints), Math.max.apply(null,xPoints)]
                    planBoundRect[storeyNo]['y'] = [Math.min.apply(null,yPoints), Math.max.apply(null,yPoints)]
                    xBR[storeyNo] = planBoundRect[storeyNo]['x'][0]
                    yBR[storeyNo] = planBoundRect[storeyNo]['y'][0]
                    wBR[storeyNo] = planBoundRect[storeyNo]['x'][1] - planBoundRect[storeyNo]['x'][0]
                    hBR[storeyNo] = planBoundRect[storeyNo]['y'][1] - planBoundRect[storeyNo]['y'][0]
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
                    bldgData['storey'][storeyNo]['spaces'][key]['storeymat']['Roof Material'] = matData[0]
                    bldgData['storey'][storeyNo]['spaces'][key]['storeymat']['Ceiling Material'] = matData[0]
                    bldgData['storey'][storeyNo]['spaces'][key]['storeymat']['Exterior Wall Material'] = matData[0]
                    bldgData['storey'][storeyNo]['spaces'][key]['storeymat']['Interior Wall Material'] = matData[0]
                    bldgData['storey'][storeyNo]['spaces'][key]['storeymat']['Floor Material'] = matData[0]
                    // bldgData['storey'][storeyNo]['spaces'][key]['occ'] = {}
                    // bldgData['storey'][storeyNo]['spaces'][key]['load'] = {}
                    // bldgData['storey'][storeyNo]['spaces'][key]['temp'] = {}
                    bldgData['storey'][storeyNo]['spaces'][key]["coords"] = data[key]
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
                sessionStorage['spaces'+"-"+storeyNo] = JSON.stringify(data)
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

function isPointOnLine(px, py, x1, y1, x2, y2, width) {

    return distancePointFromLine(px, py, x1, y1, x2, y2) <= width / 2
    // return distancePointFromLine(px, py, x1, y1, x2, y2) <= 25
}
  
function distancePointFromLine(x0, y0, x1, y1, x2, y2) {
    return Math.abs((x2 - x1) * (y1 - y0) - (x1 - x0) * (y2 - y1)) / Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

function togRad(e){
    var ele = e.target
    if(ele.id == "freezex" && freezeY.checked ){
        freezeY.checked = false
    }
    if(ele.id == "freezey" && freezeX.checked ){
        freezeX.checked = false
    }
}
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
class Point {
	//int x, y;
	constructor(x,y)
	{
		this.x=x;
		this.y=y;
	}
}

class line {
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
		&& p.x <= Math.min(l1.p1.x, l1.p2.x)
		&& (p.y <= Math.max(l1.p1.y, l1.p2.y)
			&& p.y <= Math.min(l1.p1.y, l1.p2.y)))
		return true;

	return false;
}

function direction(a, b, c)
{
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

	// When intersecting
	if (dir1 != dir2 && dir3 != dir4)
		return true;

	// When p2 of line2 are on the line1
	if (dir1 == 0 && onLine(l1, l2.p1))
		return true;

	// When p1 of line2 are on the line1
	if (dir2 == 0 && onLine(l1, l2.p2))
		return true;

	// When p2 of line1 are on the line2
	if (dir3 == 0 && onLine(l2, l1.p1))
		return true;

	// When p1 of line1 are on the line2
	if (dir4 == 0 && onLine(l2, l1.p2))
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
	let exline = new line( p, tmp );
	let count = 0;
	let i = 0;
	do {

		// Forming a line from two consecutive points of
		// poly
		let side = new line( poly[i], poly[(i + 1) % n] );
		if (isIntersect(side, exline)) {

			// If side is intersects exline
			if (direction(side.p1, p, side.p2) == 0)
				return onLine(side, p);
			count++;
		}
		i = (i + 1) % n;
	} while (i != 0);

	// When count is odd
	return count & 1;
}

