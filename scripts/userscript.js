// ==UserScript==
// @name         Hololive Easy Template
// @namespace    http://tampermonkey.net/
// @version      0.3.3
// @description  Trying
// @author       TellowKrinkle, CyberiumShadow, DutchEllie, TheGeka
// @match        https://hot-potato.reddit.com/embed*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @grant        GM_xmlhttpRequest
// @connect      githubusercontent.com

// ==/UserScript==
if (window.top !== window.self) {
    window.addEventListener('load', () => {
        const opacity = 1;
        const camera = document.querySelector("mona-lisa-embed").shadowRoot.querySelector("mona-lisa-camera");
        const canvas = camera.querySelector("mona-lisa-canvas");
        const container = canvas.shadowRoot.querySelector('.container');
        function addImage(src, posX, posY) {
            let img = document.createElement("img");
            const canvas = document.createElement("canvas");
            container.appendChild(canvas);
            img.onload = () => {
                const width = img.width;
                const height = img.height;
                canvas.width = width * 3;
                canvas.height = height * 3;
                canvas.style = `position: absolute; left: ${posX}px; top: ${posY}px; image-rendering: pixelated; width: ${width}px; height: ${height}px;`;
                const ctx = canvas.getContext("2d");
                ctx.globalAlpha = opacity;
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        ctx.drawImage(img, x, y, 1, 1, x * 3 + 1, y * 3 + 1, 1, 1);
                    }
                }
            };
            img.src = src;
        }
        GM_xmlhttpRequest({
            method: 'GET',
            fetch: true,
            responseType: 'document',
            url: 'https://raw.githubusercontent.com/TheGeka/pixel/main/templates.csv',
            onload: function (response) {
                const responses = response.responseText.split('\n')
                for (let i = 0; i < responses.length; i++) {
                    let templateObj = {
                        url: responses[i].split(',')[0],
                        xcoord: responses[i].split(',')[1],
                        ycoord: responses[i].split(',')[2]
                    }

                    addImage(templateObj.url, templateObj.xcoord, templateObj.ycoord);
                }
            }
        });
    }, false);
}
