const info = document.getElementById("info")
const loc = document.getElementById("loc")
const bldLen = document.getElementById("bldlen")
const bldWid = document.getElementById("bldwid")
const angle = document.getElementById("angle")
// const numStorey = document.getElementById("numstorey")
const divFloor = document.getElementById("divfloor")
const divBldg = document.getElementById("divbldg")
const storPlac = document.getElementById("storplac")
const storSize = document.getElementById("storsize")
const floorX = document.getElementById("floorx")
const floorY = document.getElementById("floory")
const storLen = document.getElementById("storlen")
const storWid = document.getElementById("storwid")
const storHt = document.getElementById("storht")
const spaceInfo = document.getElementById("spaceinfo")
const storeyMat = document.getElementById("storeymat")
const occ = document.getElementById("occ")
const load = document.getElementById("load")
const temp = document.getElementById("temp")
const done = document.getElementById("done")
const nextStorey = document.getElementById("nextstorey")
const infoCanvasDiv = document.getElementById("info-canvasdiv")
const storOffset = document.getElementById("storoffset")
const canvasThumb = document.getElementById("canvas-thumb")
const submit = document.getElementById("submit")

// const locData = ["Pick your location",'Delhi', 'Kuwait', 'Pakistan', 'Burkina Faso', 'Mali']
// const matData = ["Concrete Hollow Block - 15 mm.", "Concrete Hollow Block - 15 mm.","Concrete Hollow Block - 15 mm.","Concrete Hollow Block - 15 mm."]
const tableData = ["0000 hrs - 0100 hrs","0100 hrs - 0200 hrs","0200 hrs - 0300 hrs","0300 hrs - 0400 hrs","0400 hrs - 0500 hrs","0500 hrs - 0600 hrs","0600 hrs - 0700 hrs","0700 hrs - 0800 hrs","0800 hrs - 0900 hrs","0900 hrs - 1000 hrs","1000 hrs - 1100 hrs","1100 hrs - 1200 hrs","1200 hrs - 1300 hrs","1300 hrs - 1400 hrs","1400 hrs - 1500 hrs","1500 hrs - 1600 hrs","1600 hrs - 1700 hrs","1700 hrs - 1800 hrs","1800 hrs - 1900 hrs","1900 hrs - 2000 hrs","2000 hrs - 2100 hrs","2100 hrs - 2200 hrs","2200 hrs - 2300 hrs","2300 hrs - 2400 hrs"]
const rangeData = {"occ":[0,20],"load":[0,1000],"temp":[15,40]}
const unitData = {"occ": "(number)","load":"(W)","temp":"(deg C)"}
const stepData = {"occ": 1,"load":10,"temp":1}


sessionStorage['storey'] = 0
sessionStorage['matData'] = JSON.stringify(matData)
locations.unshift("Pick the building location")
for(var i = 0; i < locations.length; i++){
    loc.options[i]=new Option(locations[i],locations[i]);
}
loc.firstElementChild.setAttribute("disabled", "true")

loc.addEventListener("change", () => {
    var sendData = new FormData()
    sendData.append("info",loc.value)
    sendData.append("purpose","location")
    info.disabled = true
    fetch("/", {
        method: 'post',
        body: sendData
    })
        .then(res => res.json())
            .then(data => {
                if(data.ok){
                    console.log(data)
                    info.disabled = false;
                }    
            });

})


sessionStorage['selected-spaces'] = JSON.stringify([])
var selSpaceNo = JSON.parse(sessionStorage['selected-spaces'])

var canvas3 = document.createElement('CANVAS');
canvas3.id = "plan"
var ctx3 = canvas3.getContext('2d');
infoCanvasDiv.appendChild(canvas3)



function canvasPlan(dataImage,data,id) {
    sessionStorage['numspaces'] = Object.keys(data).length

    // var dataImage = "data:image/jpeg;base64," + imageD
    // need to load image to get its width and height 
    var img = new Image();
    img.onload =  function() {
        canvas3.width = img.width
        canvas3.height = img.height
        canvas3.style.maxWidth = "50vw"
        canvas3.style.maxHeight = "50vh"
        for (keys in data){
            ctx3.beginPath()
            ctx3.moveTo(data[keys][0][0],data[keys][0][1])
    
            for (var l=1;l<data[keys].length;l++){
                ctx3.lineTo(data[keys][l][0],data[keys][l][1])
            }
            ctx3.lineTo(data[keys][0][0],data[keys][0][1])
            ctx3.strokeStyle = "yellow"
            ctx3.stroke()
            ctx3.closePath()
        }

        ctx3.setLineDash([10]);
        // console.log(xBR,yBR,wBR,hBR)
        ctx3.strokeStyle = "red"
        ctx3.strokeRect(xBR[storeyNo],yBR[storeyNo],wBR[storeyNo],hBR[storeyNo])
        ctx3.setLineDash([]);

        canvas3.style.position = "fixed"
        var d = document.getElementsByTagName('body')[0]
        var w = d.clientWidth
        var h = d.clientHeight
        var topI = parseInt((infoCanvasDiv.style.top).replace('vh',''))*h/100
        var leftI = parseInt((infoCanvasDiv.style.left).replace('vw',''))*w/100
        const canvasW = canvas3.getBoundingClientRect().width;
        const canvasH = canvas3.getBoundingClientRect().height;
        var wBRDiv = infoCanvasDiv.getBoundingClientRect().width;
        var hBRDiv = infoCanvasDiv.getBoundingClientRect().height;
        canvas3.style.left = ((wBRDiv - canvasW)/2) + leftI
        canvas3.style.top = ((hBRDiv - canvasH)/2) + topI
    }
    img.src = dataImage;
    canvas3.addEventListener("click", (e) =>{
        if (divFloor.style.display != "block"){
            e.preventDefault();
            var cx = e.clientX
            var cy = e.clientY
            const canvasW = canvas3.getBoundingClientRect().width;
            const canvasH = canvas3.getBoundingClientRect().height;
            const origW = canvas3.width
            const origH = canvas3.height
            const top = parseFloat((canvas3.style.top).replace("px",''))
            const left = parseFloat((canvas3.style.left).replace("px",''))
            const r1 = origW / canvasW
            const r2 = origH / canvasH
            console.log(cx,cy,left,top,[cx-left,cy-top])
            console.log(canvas3.width, canvas3.height, canvasW, canvasH)
            // var selSpaceNo = JSON.parse(sessionStorage['selected-spaces'])
            var fgh = 0
            for (var keys in data){
                console.log(selSpaceNo)
                console.log(keys, data[keys], inside([(cx-left)*r1,(cy-top)*r2],data[keys]))
                if (inside([(cx-left)*r1,(cy-top)*r2],data[keys])){
                    if (selSpaceNo.includes(keys)){
                        fgh = fgh+1
                        if (fgh == 1){
                            while(selSpaceNo.indexOf(keys) !== -1) {
                                selSpaceNo.splice(selSpaceNo.indexOf(keys), 1)
                            }
                            sessionStorage['selected-spaces'] = JSON.stringify(selSpaceNo)
                            // ctx.globalAlpha = 0.0;
                            ctx3.beginPath()
                            ctx3.moveTo(data[keys][0][0],data[keys][0][1])

                            for (var l=1;l<data[keys].length;l++){
                                ctx3.lineTo(data[keys][l][0],data[keys][l][1])
                            }

                            ctx3.fillStyle = "#CFF9F8"
                            // ctx3.fillStyle = "transparent"
                            ctx3.fill()
                            ctx3.beginPath()
                            ctx3.moveTo(data[keys][0][0],data[keys][0][1])

                            for (var l=1;l<data[keys].length;l++){
                                ctx3.lineTo(data[keys][l][0],data[keys][l][1])
                            }
                            ctx3.lineTo(data[keys][0][0],data[keys][0][1])
                            // ctx.fillStyle = "white"
                            ctx3.strokeStyle = "black"
                            ctx3.stroke()
                        }


                    } else {
                        selSpaceNo.push(keys)
                        sessionStorage['selected-spaces'] = JSON.stringify(selSpaceNo)
                        ctx3.beginPath()
                        ctx3.moveTo(data[keys][0][0],data[keys][0][1])


                        for (var l=1;l<data[keys].length;l++){
                            ctx3.lineTo(data[keys][l][0],data[keys][l][1])
                        }
                        // ctx.globalAlpha = 1.0;
                        ctx3.strokeStyle = "black"
                        ctx3.fillStyle = "#FF6600"
                        ctx3.stroke()
                        ctx3.fill()
                        // ctx.closePath()
                    }
                }
            }
        }
    });

    // spaceInfo.style.display = "block"

}



function enterMatInfo() {
    spaceInfo.style.display = "none"
    storeyMat.style.display = "block"
    done.style.display = "block"
    var matEle = document.getElementById('storeymat').children
    console.log(matEle, matEle.length)
    for(var j=0;j<matEle.length;j++){
        console.log(matEle[j].tagName)
        if (matEle[j].tagName == "SELECT"){

            var eleData = JSON.parse(sessionStorage['matData'])
            // eleData.unshift(matEle[j].id)
            console.log(eleData)
            for(var i = 0; i < eleData.length; i++){
                matEle[j].options[i]=new Option(eleData[i],eleData[i]);
            }
            // matEle[j].firstElementChild.setAttribute("disabled", "true")

        }

    }

}

function rangeTable(ele) {
    spaceInfo.style.display = "none"
    ele.style.display = "block"
    done.style.display = "block"
    var child = ele.children
    var id = ele.id
    for (var t=0;t<child.length;t++){
        if(child[t].tagName == "TABLE"){
            var inp = document.getElementsByClassName(id)
            if (selSpaceNo == []){
                selSpaceNo[0] = "2"
            }
            for(i=0;i<inp.length;i++){
                inp[i].value = bldgData["storey"][storeyNo]["spaces"][selSpaceNo[0]][id][inp[i].id]
                document.getElementById(inp[i].id+"-span").value = inp[i].value
            }
            return
        }
    }
    var k = 0
    var table = document.createElement("table")
    table.style.fontSize = "small"

    //Add the data rows.
    for (key of tableData) {
        k = k+1
        // console.log(k)


        row = table.insertRow(-1);
        var cell1 = row.insertCell(-1);
        cell1.innerHTML = key + " " + unitData[id];
        cell1.style.width = "25vw"
        cell1.style.textAlign = "center"
        var cell2 = row.insertCell(-1)
        cell2.style.width = "25vw"
        // cell2.classList.add("justify")
        var span = document.createElement('div')
        cell2.appendChild(span)
        span.id = id + "-" + k + "-" + "span"
        // span.innerText = rangeData[id][0]
        span.classList.add('justify')
        span.classList.add("sliderval")
        var div = document.createElement('div')
        div.classList.add('field')
        var div1 = document.createElement('div')
        div1.classList.add('value')
        div1.classList.add('left')
        div1.innerText = rangeData[id][0]
        var div2 = document.createElement('div')
        div2.classList.add('value')
        div2.classList.add('right')
        div2.innerText = rangeData[id][1]

        var inp = document.createElement("INPUT");
        inp.type = "range"
        inp.id = id + "-" + k
        inp.min = rangeData[id][0]
        inp.max = rangeData[id][1]
        inp.classList.add("justify")
        inp.classList.add("slider")
        inp.classList.add(id)
        inp.step = stepData[id]
        // inp.value = rangeData[id][0]
        if (selSpaceNo.length == 0){
            selSpaceNo.push("2")
        }
        console.log(bldgData,selSpaceNo,selSpaceNo[0])
        console.log(bldgData["storey"][storeyNo]["spaces"][selSpaceNo[0]][id][inp.id] )
        inp.value = bldgData["storey"][storeyNo]["spaces"][selSpaceNo[0]][id][inp.id]
        span.innerText = inp.value
        // for(l=0;l<parseInt(sessionStorage['numspaces']);l++){
        //     bldgData["storey"][storeyNo]["spaces"][spaces[l+2]][inp.id] = inp.value
        // }
        
        inp.addEventListener("change", (e) => {
            var spanId = e.target.id + "-" + "span"
            document.getElementById(spanId).innerText = document.getElementById(e.target.id).value

            var n = parseInt((e.target.id).split("-")[1])
            var element = (e.target.id).split("-")[0]
            var newId = element + "-" + (n+1)
            for(var z=n+1;z<25;z++){
                var newId = element + "-" + z
                document.getElementById(newId).value = document.getElementById(e.target.id).value
                var newSpanId = newId + "-" +"span"
                document.getElementById(newSpanId).innerText = document.getElementById(e.target.id).value
            }
        })
        div.appendChild(div1)
        div.appendChild(inp)
        div.appendChild(div2)
        cell2.appendChild(div)
    }
    ele.appendChild(table)

}

done.addEventListener('click', (e) => {
    // var inp = document.getElementsByTagName('input')
    // var sel = document.getElementsByTagName('select')
    if (divBldg.style.display == "block"){
        // var num = parseInt(numStorey.value)
        // console.log(num+1)
        // numStorey.disabled = true
        // console.log(numStorey.value)
        var infoCheck = (loc.value == "Select Location" || angle.value == "")
        if (infoCheck){
            alert("Please input building location and angle of north.")
        } else {
            bldgData['loc'] = loc.value
            bldgData['angle'] = angle.value
            // compTblData.push(["Location of Building (m)",loc.value])
            // compTblData.push(["Direction of North from Vetical (deg)",angle.value])
            sessionStorage['storey'] = parseInt(sessionStorage['storey'])+1
            // sessionStorage['numStorey'] = num
            // storeyNo = storeyNo + 1
            // storPlac.innerText = "Placement of Storey " + storeyNo + " on the building bounding rectangle"
            // storSize.innerText = "Size of Storey " + storeyNo
        }

    }
    if (divFloor.style.display == "block"){
        // storLen.value = bldLen.value
        // storWid.value = bldWid.value
        // floorX.value = 0
        // floorY.value = 0
        var fields = ["storlen","storwid","storht","floorx","floory"]
        // var inp = info.children
        // var inp = document.getElementsByTagName('input')
        // var sel = document.getElementsByTagName('select')
        if (storeyNo ==1){
            floorX.value = 0
            floorY.value = 0
            if (storLen.value == "" || storWid.value == "" || storHt.value == "" ){
                alert('Please input all information regarding the storey')
            } else {
                bldgData['bldlen'] = storLen.value
                bldgData['bldwid'] = storWid.value
                bldgData["storey"][storeyNo]['storlen'] = storLen.value
                bldgData["storey"][storeyNo]['storwid'] = storWid.value
                bldgData["storey"][storeyNo]['storht'] = storHt.value
                bldgData["storey"][storeyNo]['floorx'] = 0
                bldgData["storey"][storeyNo]['floory'] = 0
                divFloor.style.display = "none"
                spaceInfo.style.display = "block"
                submit.style.display = "block"
                done.style.display = "none"
                var ddata = JSON.parse(sessionStorage['spaces-'+storeyNo])
                ctx3.clearRect(0,0,canvas3.width,canvas3.height)
                for (keys in ddata){
                    ctx3.beginPath()
                    ctx3.moveTo(ddata[keys][0][0],ddata[keys][0][1])
            
                    for (var l=1;l<ddata[keys].length;l++){
                        ctx3.lineTo(ddata[keys][l][0],ddata[keys][l][1])
                    }
                    ctx3.lineTo(ddata[keys][0][0],ddata[keys][0][1])
                    ctx3.strokeStyle = "black"
                    ctx3.stroke()
                    ctx3.closePath()
                }
        
                ctx3.setLineDash([10]);
                ctx3.strokeStyle = "red"
                ctx3.strokeRect(xBR[storeyNo],yBR[storeyNo],wBR[storeyNo],hBR[storeyNo])
                ctx3.setLineDash([]);
            }
        } else {
            if (storLen.value > bldgData['bldlen']){
                bldgData['bldlen'] = storLen.value
            }
            if (storWid.value > bldgData['bldwid']){
                bldgData['bldwid'] = storWid.value
            }
            if (storOffset.style.display == "block"){
                var flag = 0
                for(i=0;i<fields.length;i++){
                    if (document.getElementById(fields[i]).value == ""){
                        flag = 10
                    } else {
                        bldgData["storey"][storeyNo][fields[i]] = document.getElementById(fields[i]).value
                    }
                    
                }
                // storPlac.innerText = "Placement of Storey " + storeyNo + " on the building bounding rectangle"
                // storSize.innerText = "Size of Storey " + storeyNo
                // var flag = dataCap()
                if (flag == 10){
                    alert('Please input all information regarding the storey')
                } else {
                    // next.style.display = "none"
                    ctx3.clearRect(0,0,canvas3.width,canvas3.height)
                    var ddata = JSON.parse(sessionStorage['spaces-'+storeyNo])
                    for (keys in ddata){
                        ctx3.beginPath()
                        ctx3.moveTo(ddata[keys][0][0],ddata[keys][0][1])
                
                        for (var l=1;l<ddata[keys].length;l++){
                            ctx3.lineTo(ddata[keys][l][0],ddata[keys][l][1])
                        }
                        ctx3.lineTo(ddata[keys][0][0],ddata[keys][0][1])
                        ctx3.strokeStyle = "black"
                        ctx3.stroke()
                        ctx3.closePath()
                    }
            
                    ctx3.setLineDash([10]);
                    ctx3.strokeStyle = "red"
                    ctx3.strokeRect(xBR[storeyNo],yBR[storeyNo],wBR[storeyNo],hBR[storeyNo])
                    ctx3.setLineDash([]);

                    divFloor.style.display = "none"
                    // divBldg.style.display = "none"
                    spaceInfo.style.display = "block"
                    submit.style.display = "block"
                    done.style.display = "none"
                    // compTable();
                    // drawBtn.click()
                    // planUpload();  
                }

            } else {
                storPlac.innerText = "Offset between this storey (red) and the first storey (blue) bounding rectangle"
                var thisH = storLen.value
                var thisW = storWid.value
                var lastH = bldgData['storey'][storeyNo-1]['storlen']
                var lastW = bldgData['storey'][storeyNo-1]['storwid']
                var lastHD = hBR[storeyNo]*lastH/thisH
                var lastWD = wBR[storeyNo]*lastW/thisW
                ctx3.setLineDash([10]);
                ctx3.strokeStyle = "red"
                ctx3.strokeRect(xBR[storeyNo],yBR[storeyNo],wBR[storeyNo],hBR[storeyNo])
                ctx3.strokeStyle = "blue"
                ctx3.strokeRect(xBR[storeyNo] + 50,yBR[storeyNo-1]+50,lastWD,lastHD)
                ctx3.setLineDash([]);
                storOffset.style.display = "block";
            }
        }

    } else {
        var divs = document.getElementsByTagName('div')

        var capDivs = ['storeymat','occ','load','temp']
        for(i=0;i<divs.length;i++){
            console.log(divs[i].id)
            if(capDivs.includes(divs[i].id) && divs[i].style.display != "none"){
                var ptr = divs[i].id
            }
            console.log(ptr)
        }
    
        var inp = document.getElementsByClassName(ptr)
        for(i=0;i<inp.length;i++){
            // console.log(inp[i].id)
            var spaces = JSON.parse(sessionStorage['selected-spaces'])
            // console.log(spaces)
            if(spaces.length == 0){
                var spaceData = JSON.parse(sessionStorage['spaces'+"-"+storeyNo])
                spaces = Object.keys(spaceData)
                // console.log(spaceData,spaces)
            }
            // console.log(spaces)
            for (l=0;l<spaces.length;l++){
                console.log(inp[i].id,inp[i].value)
                bldgData["storey"][storeyNo]["spaces"][spaces[l]][ptr][inp[i].id] = inp[i].value
            }
        }    
        done.style.display = "none"
        storeyMat.style.display = "none"
        occ.style.display = "none"
        load.style.display = 'none'
        temp.style.display = "none"
        divFloor.style.display = "none"
        spaceInfo.style.display = "block"
        submit.style.display = "block"
        console.log(bldgData)

    }


    // }
})

function sameCheck(ele){
    if (ele.checked){
        var fields = ["storlen","storwid","storht","floorx","floory"]
        for(i=0;i<fields.length;i++){
            bldgData["storey"][storeyNo][fields[i]] = bldgData["storey"][storeyNo-1][fields[i]]   
        }
    }
    done.click();
    // done.style.display = "none"
    // divFloor.style.display = "none"
    // spaceInfo.style.display = "block"
}

function edit(){
    info.style.display = "none"
    drawPlan.style.display = "block"
    ctx3.clearRect(0,0,canvas3.width,canvas3.height)
    ctx2.clearRect(0,0,canvas2.width,canvas2.height)
    var ddata = JSON.parse(sessionStorage['spaces-'+storeyNo])
    lines.length = 0
    for (keys in ddata){
        ctx2.beginPath()
        ctx2.moveTo(ddata[keys][0][0],ddata[keys][0][1])

        for (var l=1;l<ddata[keys].length;l++){
            ctx2.lineTo(ddata[keys][l][0],ddata[keys][l][1])
            lines.push([ddata[keys][l-1][0],ddata[keys][l-1][1],ddata[keys][l][0],ddata[keys][l][1]])
            var z = l
        }
        lines.push([ddata[keys][z][0],ddata[keys][z][1],ddata[keys][0][0],ddata[keys][0][1]])
        ctx2.lineTo(ddata[keys][0][0],ddata[keys][0][1])
        ctx2.strokeStyle = "black"
        ctx2.stroke()
        ctx2.closePath()
    }

}

function basementNote() {
    bldgData["storey"][storeyNo]['basement'] = "yes"
}


nextStorey.addEventListener('click', (e) => {
    console.log(bldgData)
    if (storeyNo>3){
        document.getElementById('canvas-thumb').style.overflow = "scroll"
    }
    html2canvas(document.getElementById("plan"), {background:'#FF6600',
        onrendered: function(c) {
            const context = c.getContext("2d")
            context.resetTransform();
            context.globalCompositeOperation = 'destination-over';
            context.fillStyle = '#FF6600';
            context.fillRect(0,0,c.width,c.height);
        }
    }).then(function(c){
        var dId = "thumb-"+storeyNo
        if(document.getElementById(dId)){
            // var eles = document.getElementById(dId).children
            // for (i=0;i<eles.length;i++){
            //     eles[0].remove()
            // }
            document.getElementById(dId).remove()

        }
        c.style.maxWidth = "20vw" 
        c.style.maxHeight = "20vh"
        // c.style.margin = "5vw"
        c.style.display = "block"
        var d = document.createElement('DIV')
        d.id = "thumb-"+storeyNo
        var h = document.createElement('H4')
        h.innerText = "Storey " + storeyNo
        d.style.borderRadius = "5px"
        d.style.height = "25vh"
        d.style.position = "relative"
        // d.style.left = 25 * (storeyNo - 1) + "vw"
        d.style.border = "solid"
        d.style.background = "#FF6600"
        d.appendChild(c)
        d.appendChild(h)
        h.classList.add("justify")
        d.style.display = "inline-block"
        canvasThumb.appendChild(d)
        d.setAttribute('data-title','Click to edit this storey.')
        d.classList.add("hover-msg")
        d.addEventListener('click', (event) => {
            // e.target.id = this.id
            console.log(event.target.parentNode.id)
            // storeyNo = parseInt((e.target.id).split("-")[1])
            parentN = event.target.parentNode
            storeyNo = parseInt((parentN.id).split("-")[1])
            console.log(e.target.id,storeyNo)
            var cdata = JSON.parse(sessionStorage['spaces-'+storeyNo])
            spaceInfo.style.display = "none"
            divFloor.style.display = "block"
            if(storeyNo > 1){
                storOffset.style.display = "block";
            } else {
                storOffset.style.display = "none";
            }
            storSize.innerText = "Size of Storey " + storeyNo + " bounding rectangle (red-dashed)"
            done.style.display = "block"
            
            storLen.value = bldgData["storey"][storeyNo]['storlen']
            storWid.value = bldgData["storey"][storeyNo]['storwid']
            storHt.value = bldgData["storey"][storeyNo]['storht']
            floorX.value = bldgData["storey"][storeyNo]['floorx']
            floorY.value = bldgData["storey"][storeyNo]['floory']
            canvasPlan(storeyPlanImage[storeyNo],cdata,'pic'+storeyNo)

        })
        ctx3.clearRect(0,0,canvas3.width,canvas3.height)
        spaceInfo.style.display = "none"
        // divFloor.style.display = "block"
        // next.style.display = "block"
        storeyNo = storeyNo+1
        // storPlac.innerText = "Placement of Storey" + storeyNo + "on the building bounding rectangle"
        // storSize.innerText = "Size of Storey " + storeyNo + " bounding rectangle (red-dashed)"
        divBldg.style.left = "85vw"
        divBldg.style.top = "10vh"
        divBldg.style.border = "solid"
        info.style.display = "none"
        drawPlan.style.display = "block"

    });

})


document.getElementById("submit").addEventListener("click", () => {
    refineBldgData()
    var sendData = new FormData()
    sendData.append("info",JSON.stringify(bldgData))
    sendData.append("purpose","data")
    fetch("/", {
        method: 'post',
        body: sendData
    })
        .then(response => response.text())
            .then((html) => {
                document.body.innerHTML = html     
            });
            
        // .then(res => res.json())
        //     .then(data => {
        //         if (data.ok) {
        //             console.log(data)

        //         }
        //     })
})


function inside(point, vs) {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html
    
    var x = point[0], y = point[1];
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};

function refineBldgData(){
    var minX = 0
    var minY = 0
    var maxX = 0
    var maxY = 0
    for (var key in bldgData["storey"]){

        if (bldgData["storey"][key]['floorx'] < minX){
            minX = bldgData["storey"][key]['floorx']
        }
        if (bldgData["storey"][key]['floory'] < minY){
            minY = bldgData["storey"][key]['floory']
        }
        var ty = bldgData["storey"][key]['storlen'] + bldgData["storey"][key]['floory'] - bldgData["storey"][1]['storlen']
        if ( ty > maxY){
            maxY = ty
        }
        var tx = bldgData["storey"][key]['storwid'] + bldgData["storey"][key]['floorx'] - bldgData["storey"][1]['storwid']
        if (tx > maxX){
            maxX = tx
        }
    }
    bldgData["bldlen"] = bldgData["storey"][1]['storlen'] + Math.abs(minY) + maxY
    bldgData["bldwid"] = bldgData["storey"][1]['storwid'] + Math.abs(minX) + maxX
    bldgData["angle"] = angle.value
    bldgData['loc'] = loc.value

    for (var k in bldgData["storey"]){

        bldgData["storey"][k]['floorx'] = Math.abs(bldgData["storey"][k]['floorx'] - minX)
        bldgData["storey"][k]['floory'] = Math.abs(bldgData["storey"][k]['floorx'] - minY) 
    }
}