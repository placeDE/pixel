// ==UserScript==
// @name         Hololive combo
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Spread the love
// @author       oralekin
// @match        https://hot-potato.reddit.com/embed*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @grant        none
// ==/UserScript==
if (window.top !== window.self) {
	window.addEventListener("load", () => {
		const opacity = 1;
		const camera = document.querySelector("mona-lisa-embed").shadowRoot.querySelector("mona-lisa-camera");
		const layout = document.querySelector("mona-lisa-embed").shadowRoot;
		const canvas = camera.querySelector("mona-lisa-canvas");
		const container = canvas.shadowRoot.querySelector(".container");
		function addImage(src, posX, posY) {
			let img = document.createElement("img");
			const hint = document.createElement("canvas");
			const plan = document.createElement("canvas");
			img.onload = () => {
				const width = img.width;
				const height = img.height;
				hint.setAttribute("id", "hintOverlay");
				hint.width = width * 3;
				hint.height = height * 3;
				hint.style = `
					position: absolute;
					left: ${posX}px;
					top: ${posY}px;
					image-rendering: pixelated;
					width: ${width}px;
					height: ${height}px;`;
				const t_ctx = hint.getContext("2d");
				t_ctx.globalAlpha = opacity;
				for (let y = 0; y < height; y++) {
					for (let x = 0; x < width; x++) {
						t_ctx.drawImage(img, x, y, 1, 1, x * 3 + 1, y * 3 + 1, 1, 1);
					}
				}

				plan.setAttribute("id", "planOverlay");
				plan.width = width;
				plan.height = height;
				plan.style = `
					position: absolute;
					left: ${posX}px;
					top: ${posY}px;
					image-rendering: pixelated;
					width: ${width}px;
					height: ${height}px;`;
				const i_ctx = plan.getContext("2d");
				i_ctx.globalAlpha = opacity;
				i_ctx.drawImage(img, 0, 0);
			};
			img.src = src;
			return [hint, plan];
		}

		const waitForPreview = setInterval(() => {
			const preview = camera.querySelector("mona-lisa-pixel-preview");
			if (preview) {
				clearInterval(waitForPreview);
				const style = document.createElement("style");
				const loEx = -20;
				const hiEx = 120;
				const loIn = 30;
				const hiIn = 69;
				style.innerHTML = `.pixel {
					clip-path: polygon(
						${loEx}% ${loEx}%,
						${loEx}% ${hiEx}%,
						${loIn}% ${hiEx}%,
						${loIn}% ${loIn}%,
						${hiIn}% ${loIn}%,
						${hiIn}% ${hiIn}%,
						${loIn}% ${hiIn}%,
						${loIn}% ${hiEx}%,
						${hiEx}% ${hiEx}%,
						${hiEx}% ${loEx}%
					) !important;
				}`;
				preview.shadowRoot.appendChild(style);

				loadRegions();
				setTimeout(() => {
					loadRegions();
					if (typeof regionInterval == "undefined") {
						const regionInterval = setInterval(loadRegions, 5000);
					}
				}, 1000);
			}
		}, 100);

		function insertAfter(newNode, referenceNode) {
			referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
		}
		// I would like to personally thank the osu team for inspiring (read: letting me copy paste) this code
		// free software :P
		function addCheckbox(y, id, label, checked, onclick) {
			let visCheckbox = document.createElement("div");

			// designed to be below the osu team's slider
			visCheckbox.style = `
				position: fixed;
				left: calc(var(--sail) + 16px);
				right: calc(var(--sair) + 16px);
				display: flex;
				flex-flow: row nowrap;
				align-items: center;
				justify-content: center;
				height: 40px;
				top: calc(var(--sait) + ${y}px);
				text-shadow: black 1px 0 10px;
				text-align: center;
			`;

			let visText = document.createElement("div");
			visText.innerText = label;
			visCheckbox.appendChild(visText);
			visText.style = "background-color: rgba(0, 0, 0, 0.5)";

			let visInput = document.createElement("input");
			visInput.setAttribute("type", "checkbox");
			visInput.setAttribute("id", id);
			visInput.setAttribute("name", "checkbox");
			visInput.checked = checked;
			visInput.onclick = () => onclick(visInput.checked);
			visCheckbox.appendChild(visInput);

			let topControls = document.querySelector("mona-lisa-embed").shadowRoot.querySelector(".layout .top-controls");
			insertAfter(visCheckbox, topControls);
		}

		let [hint, plan] = addImage("https://raw.githubusercontent.com/TheGeka/pixel/main/output.png", 0, 0);

		function loadRegions() {
			const hintId = "visHintCheckbox";
			const planId = "visPlanCheckbox";
			if (!layout.contains(layout.querySelector(`#${hintId}`))) {
				const toggleOverlay = checked => {
					container.querySelector("#hintOverlay").style.display = checked ? "block" : "none";
				};
				addCheckbox(80, hintId, "Show hint", true, toggleOverlay);
				container.appendChild(hint);
			}
			if (!layout.contains(layout.querySelector(`#${planId}`))) {
				const changeOverlay = checked => {
					container.querySelector("#planOverlay").style.display = checked ? "block" : "none";
				};
				addCheckbox(112, planId, "Preview full plans", false, changeOverlay);
				container.appendChild(plan);
        changeOverlay(false);
			}
		}
	}, false);
}
