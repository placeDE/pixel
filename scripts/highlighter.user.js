// ==UserScript==
// @name         Highlight Tool
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  try to take over the canvas!
// @author       oralekin, LittleEndu, ekgame, Wieku, DeadRote, Thank you Osu Server for the Highlight feature - Senpoii
// @match        https://hot-potato.reddit.com/embed*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @grant        none
// ==/UserScript==
if (window.top !== window.self) {
    window.addEventListener('load', () => {
        // Load the image
        const image = document.createElement("img");
        const undotted = "https://raw.githubusercontent.com/TheGeka/pixel/main/shadowmap.png";
        image.src = "https://raw.githubusercontent.com/TheGeka/pixel/main/output.png";

        image.onload = () => {
             image.style = `position: absolute; left: 0; top: 0; width: ${image.width/3}px; height: ${image.height/3}px; image-rendering: pixelated; z-index: 1`;
        };

        // Add the image as overlay
        const camera = document.querySelector("mona-lisa-embed").shadowRoot.querySelector("mona-lisa-camera");
        const layout = document.querySelector("mona-lisa-embed").shadowRoot;
        const canvas = camera.querySelector("mona-lisa-canvas");
        canvas.shadowRoot.querySelector('.container').appendChild(image);
      
        // Add a style to put a hole in the pixel preview (to see the current or desired color)
        const waitForPreview = setInterval(() => {
            const preview = camera.querySelector("mona-lisa-pixel-preview");
            if (preview) {
              clearInterval(waitForPreview);
              const style = document.createElement('style')
              style.innerHTML = '.pixel { clip-path: polygon(-20% -20%, -20% 120%, 37% 120%, 37% 37%, 62% 37%, 62% 62%, 37% 62%, 37% 120%, 120% 120%, 120% -20%); }'
              preview.shadowRoot.appendChild(style);
              loadRegions()
              setTimeout(()=>{
                  loadRegions();
                  if(typeof regionInterval == "undefined") {
                      const regionInterval = setInterval(()=>{
                          loadRegions()
                      },5000)
                      }
              },1000)
            }
        }, 100);
        //Insert element after another element
        function insertAfter(newNode, referenceNode) {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        }

        //Slider initialization
        function initSlider(){
            let visSlider = document.createElement("div");

            visSlider.style = `
                     position: fixed;
                     left: calc(var(--sail) + 16px);
                     right: calc(var(--sair) + 16px);
                     display: flex;
                     flex-flow: row nowrap;
                     align-items: center;
                     justify-content: center;
                     height: 40px;
                     top: calc(var(--sait) + 48px);
                     text-shadow: black 1px 0 10px;
                     text-align:center;
                `;

            //Text
            let visText = document.createElement("div");
            visText.innerText = "Highlight zones";
            visSlider.appendChild(visText);

            let lineSeparator = document.createElement("br");
            visSlider.appendChild(lineSeparator);

            //Range slider input
            let visInput = document.createElement("input");
            visInput.setAttribute("type","range");
            visInput.setAttribute("id","visRange");
            visInput.setAttribute("name","range");
            visInput.setAttribute("min","0");
            visInput.setAttribute("max","100");
            visInput.setAttribute("step","1");
            visInput.value = 0;

            //Range slider label (name)
            let visLabel = document.createElement("label");
            visLabel.innerText = '0'


            visSlider.appendChild(visInput);
            visSlider.appendChild(visLabel);

            var inputEvtHasNeverFired = true;

            var rangeValue = {current: undefined, mostRecent: undefined};

            visInput.addEventListener("input", function(evt) {
                inputEvtHasNeverFired = false;
                rangeValue.current = evt.target.value;
                if (rangeValue.current !== rangeValue.mostRecent) {
                    visInput.value = rangeValue.current;
                    visLabel.innerText = rangeValue.current+'';
                    placeGlobal.visLevel = rangeValue.current/100;
                    placeGlobal.svgMask.style.opacity = placeGlobal.visLevel+'';
                }
                rangeValue.mostRecent = rangeValue.current;
            });

            let topControls = document.querySelector("mona-lisa-embed").shadowRoot.querySelector(".layout .top-controls");
            insertAfter(visSlider,topControls);
            placeGlobal.slider = visSlider;
        }

        //Generate SVG function
        function generateSVG(){
            let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("width","2000px");
            svg.setAttribute("height","2000px");
            svg.style = `
            position: absolute;
            left: 0;
            top: 0;
            z-index: 1;
            opacity: `+placeGlobal.visLevel+`;`;

            let svgDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            svg.appendChild(svgDefs);

            let mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
            mask.setAttribute("id","osuplaceMask");
            svgDefs.appendChild(mask);

            let mainMask = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
            mainMask.setAttribute('x', "0");
            mainMask.setAttribute("y","0");
            mainMask.setAttribute('height', "100%");
            mainMask.setAttribute('width', "100%");
            mainMask.setAttribute('fill', 'white');
            mask.appendChild(mainMask);

            let imageMask = document.createElementNS("http://www.w3.org/2000/svg", 'image');
            imageMask.setAttribute('href',undotted)
            imageMask.setAttribute('x', "0");
            imageMask.setAttribute("y","0");
            imageMask.setAttribute('height', "100%");
            imageMask.setAttribute('width', "100%");
            mask.appendChild(imageMask);

            let svgBody = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            svgBody.setAttribute("width","2000px");
            svgBody.setAttribute("height","2000px");
            svgBody.setAttribute("x","0");
            svgBody.setAttribute("y","0");
            svg.appendChild(svgBody);

            let bodyRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bodyRect.setAttribute("width","2000px");
            bodyRect.setAttribute("height","2000px");
            bodyRect.setAttribute("x","0");
            bodyRect.setAttribute("y","0");
            bodyRect.setAttribute("fill","rgba(0,0,0,0.6)");
            bodyRect.setAttribute("mask","url(#osuplaceMask)")
            svgBody.appendChild(bodyRect);

            return svg
        }

        //Global variables
        var placeGlobal = {
            visLevel: 0,
            slider: null,
            svgMask: null
        }

        //Load mask
        function loadRegions(){
            if(placeGlobal.svgMask != null){
                placeGlobal.svgMask.remove();
            }

            let svgClipBody = generateSVG();

            placeGlobal.svgMask = svgClipBody;

            //Generate slider UI

            //if(placeGlobal.slider == null ){
                let sliderState = layout.contains(layout.querySelector('#visRange'));
                if(!sliderState){
                    initSlider();
                }
            //}

            canvas.shadowRoot.querySelector('.container').appendChild(svgClipBody);
        }

    }, false);
}
