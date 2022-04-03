import WebSocket from 'ws';
import getPixels from "get-pixels";
import fetch from 'node-fetch';

//Logging
import sig from 'signale';
const {Signale} = sig;

const options = {
    types: {
      debug: {
        color: 'cyan'
      }
    }
  };
 
const signale = new Signale(options);  
signale.config({
    displayFilename: true,
    displayTimestamp: true,
    displayDate: false
}); 


var placeOrders = [];

const args = process.argv.slice(2);
if (args.length  == 0) {
    signale.error('Missing access token.');
    process.exit(1);
}
let defaultAccessToken = args[0];

if (args.length > 4) {
    console.warn("Mehr als 4 Reddit Accounts gleichzeitig werden nicht empfohlen!")
}


const COLOR_MAPPINGS = {
	'#BE0039': 1,
	'#FF4500': 2,
	'#FFA800': 3,
	'#FFD635': 4,
	'#00A368': 6,
	'#00CC78': 7,
	'#7EED56': 8,
	'#00756F': 9,
	'#009EAA': 10,
	'#2450A4': 12,
	'#3690EA': 13,
	'#51E9F4': 14,
	'#493AC1': 15,
	'#6A5CFF': 16,
	'#811E9F': 18,
	'#B44AC0': 19,
	'#FF3881': 22,
	'#FF99AA': 23,
	'#6D482F': 24,
	'#9C6926': 25,
	'#000000': 27,
	'#898D90': 29,
	'#D4D7D9': 30,
	'#FFFFFF': 31
};

(async function () {
	setInterval(updateOrders, 5 * 60 * 1000); // Update orders every 5 minutes
	await updateOrders();

	const interval = 300 / args.length;
    var delay = 0;
    for (const accessToken of args) {
        setTimeout(() => attemptPlace(accessToken), delay * 1000);
        delay += interval;
    }
})();

let rgbaJoin = (a1, a2, rowSize = 1000, cellSize = 4) => {
    const rawRowSize = rowSize * cellSize;
    const rows = a1.length / rawRowSize;
    let result = new Uint8Array(a1.length + a2.length);
    for (var row = 0; row < rows; row++) {
        result.set(a1.slice(rawRowSize * row, rawRowSize * (row+1)), rawRowSize * 2 * row);
        result.set(a2.slice(rawRowSize * row, rawRowSize * (row+1)), rawRowSize * (2 * row + 1));
    }
    return result;
};

function shuffleWeighted(array) {
	for (const item of array) {
		item.rndPriority = Math.round(placeOrders.priorities[item.priority] * Math.random());
	}
	array.sort((a, b) => b.rndPriority - a.rndPriority);
}

function getPixelList() {
	const structures = [];
	for (const structureName in placeOrders.structures) {
		shuffleWeighted(placeOrders.structures[structureName].pixels);
		structures.push(placeOrders.structures[structureName]);
	}
	shuffleWeighted(structures);
	return structures.map(structure => structure.pixels).flat();
}

async function attemptPlace(token) {
    var map0;
    var map1;
	let retry = () => attemptPlace(token);
    try {
        map0 = await getMapFromUrl(await getCurrentImageUrl('0'))
        map1 = await getMapFromUrl(await getCurrentImageUrl('1'));
    } catch (e) {
        signale.warn('Fehler beim Abrufen der Zeichenfläche. Neuer Versuch in 15 Sekunden: ', e);
        setTimeout(retry, 15000); // probeer opnieuw in 15sec.
        return;
    }

    const rgbaCanvas = rgbaJoin(map0.data, map1.data);
	const pixelList = getPixelList();

	let foundPixel = false;
	let wrongCount = 0;

	for (const order of pixelList) {
		const x = order.x;
		const y = order.y;
		const colorId = COLOR_MAPPINGS[order.color] ?? order.color;

		//const rgbaAtLocation = ctx.getImageData(x, y, 1, 1).data;
        const rgbaAtLocation = getRgbaAt(rgbaCanvas, x, y);
		const hex = rgbToHex(rgbaAtLocation[0], rgbaAtLocation[1], rgbaAtLocation[2]);
		const currentColorId = COLOR_MAPPINGS[hex];
		// Pixel already set
		if (currentColorId == colorId) continue;
		wrongCount++;

		if (foundPixel) continue;
		foundPixel = true;

        signale.info('Pixel wird gesetzt auf ' + x + ', ' + y +'...');

		const time = new Date().getTime();
		let nextAvailablePixelTimestamp = await place(x, y, colorId, token) ?? new Date(time + 1000 * 60 * 5 + 1000 * 15)

		// Sanity check timestamp
		if (nextAvailablePixelTimestamp < time || nextAvailablePixelTimestamp > time + 1000 * 60 * 5 + 1000 * 15) {
			nextAvailablePixelTimestamp = time + 1000 * 60 * 5 + 1000 * 15;
		}

		// Add a few random seconds to the next available pixel timestamp
		const waitFor = nextAvailablePixelTimestamp - time + (Math.random() * 1000 * 15);

		const minutes = Math.floor(waitFor / (1000 * 60))
		const seconds = Math.floor((waitFor / 1000) % 60)
        signale.info('Warten auf Abkühlzeit ' + minutes + ':' + seconds + ' bis ' + new Date(nextAvailablePixelTimestamp).toLocaleTimeString());
		setTimeout(retry, waitFor);
	}

	if	(foundPixel) {
		signale.info( `${wrongCount} sind noch falsch`)
		return
	}

    signale.success('Alle bestellten Pixel haben bereits die richtige Farbe!');
	setTimeout(retry, 2 * 1000); // probeer opnieuw in 30sec.
}


function updateOrders() {
	fetch(`https://raw.githubusercontent.com/etonaly/pixel/main/pixel.json`, {cache: "no-store"}).then(async (response) => {
		if (!response.ok) return signale.warn('Bestellungen können nicht geladen werden!');
		const data = await response.json();

		if (JSON.stringify(data) !== JSON.stringify(placeOrders)) {
			const structureCount = Object.keys(data.structures).length;
			let pixelCount = 0;
			for (const structureName in data.structures) {
				pixelCount += data.structures[structureName].pixels.length;
			}
            signale.info('Neue Strukturen geladen. Bilder: ' + structureCount + ' - Pixels: ' + pixelCount + '.');
		}

        // TODO:
		/*if (data?.version !== VERSION && !UPDATE_PENDING) {
			UPDATE_PENDING = true
			Toastify({
				text: `NEUE VERSION VERFÜGBAR! Aktualisiere hier https://github.com/etonaly/pixel/raw/main/placedebot.user.js`,
				duration: -1,
				onClick: () => {
					// Tapermonkey captures this and opens a new tab
					window.location = 'https://github.com/etonaly/pixel/raw/main/placedebot.user.js'
				}
			}).showToast();

		}*/
		placeOrders = data;
	}).catch((e) => signale.warn('Bestellungen können nicht geladen werden!', e));
}

/**
 * Places a pixel on the canvas, returns the "nextAvailablePixelTimestamp", if succesfull
 * @param x
 * @param y
 * @param color
 * @returns {Promise<number>}
 */
 async function place(x, y, color, token = defaultAccessToken) {
	const response = await fetch('https://gql-realtime-2.reddit.com/query', {
		method: 'POST',
		body: JSON.stringify({
			'operationName': 'setPixel',
			'variables': {
				'input': {
					'actionName': 'r/replace:set_pixel',
					'PixelMessageData': {
						'coordinate': {
							'x': x % 1000,
							'y': y % 1000
						},
						'colorIndex': color,
						'canvasIndex': (x > 999 ? 1 : 0)
					}
				}
			},
			'query': `mutation setPixel($input: ActInput!) {
				act(input: $input) {
					data {
						... on BasicMessage {
							id
							data {
								... on GetUserCooldownResponseMessageData {
									nextAvailablePixelTimestamp
									__typename
								}
								... on SetPixelResponseMessageData {
									timestamp
									__typename
								}
								__typename
							}
							__typename
						}
						__typename
					}
					__typename
				}
			}
			`
		}),
		headers: {
			'origin': 'https://hot-potato.reddit.com',
			'referer': 'https://hot-potato.reddit.com/',
			'apollographql-client-name': 'mona-lisa',
			'Authorization': `Bearer ${token}`,
			'Content-Type': 'application/json'
		}
	});
	const data = await response.json()
	if (data.errors != undefined) {
        signale.warn("Fehler beim Platzieren des Pixels, warte auf Abkühlzeit...");
		return data.errors[0].extensions?.nextAvailablePixelTs
	} else {
        signale.success("Pixel wurde platziert!")
    }
	return data?.data?.act?.data?.[0]?.data?.nextAvailablePixelTimestamp
}


async function getCurrentImageUrl(id = '0') {
	return new Promise((resolve, reject) => {
		const ws = new WebSocket('wss://gql-realtime-2.reddit.com/query', 'graphql-ws', {
        headers : {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:98.0) Gecko/20100101 Firefox/98.0",
            "Origin": "https://hot-potato.reddit.com"
        }
      });

		ws.onopen = () => {
			ws.send(JSON.stringify({
				'type': 'connection_init',
				'payload': {
					'Authorization': `Bearer ${defaultAccessToken}`
				}
			}));

			ws.send(JSON.stringify({
				'id': '1',
				'type': 'start',
				'payload': {
					'variables': {
						'input': {
							'channel': {
								'teamOwner': 'AFD2022',
								'category': 'CANVAS',
								'tag': id
							}
						}
					},
					'extensions': {},
					'operationName': 'replace',
					'query': 'subscription replace($input: SubscribeInput!) {\n  subscribe(input: $input) {\n    id\n    ... on BasicMessage {\n      data {\n        __typename\n        ... on FullFrameMessageData {\n          __typename\n          name\n          timestamp\n        }\n      }\n      __typename\n    }\n    __typename\n  }\n}'
				}
			}));
		};

		ws.onmessage = (message) => {
			const { data } = message;
			const parsed = JSON.parse(data);

			if (!parsed.payload) {
                return;
            }

            if (parsed.payload.hasOwnProperty('message')) {
                signale.fatal('Error while getting current image url: ' + parsed.payload.message + ' - Möglicherweise ein ungültiger access-token.');
            }

            if (!parsed.payload.data || !parsed.payload.data.subscribe || !parsed.payload.data.subscribe.data) {
                return;
            }

			ws.close();
			resolve(parsed.payload.data.subscribe.data.name + `?noCache=${Date.now() * Math.random()}`);
		}


		ws.onerror = reject;
	});
}

function getMapFromUrl(url) {
    return new Promise((resolve, reject) => {
        getPixels(url, function(err, pixels) {
            if(err) {
                signale.error("Could not get Map");
                reject()
                return
            }
            signale.debug("Got pixels from Map ", pixels.shape.slice())
            resolve(pixels)
        })
    });
}

function getRgbaAt(rgbaCanvas, x, y) {
    var start = (y*2000 + x) * 4;
    var rgba = rgbaCanvas.slice(start, start+4);

    return rgba;
}

function rgbToHex(r, g, b) {
	return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}