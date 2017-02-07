[
	{
		"idx": 0,
		"sref": "p02s1",
		"coinRef":"p02",
		"nav": {
			"id": "p02s1",
			"page": 2,
			"scene": 1
		},

		"template":"default.html",
		
		"bgImg": {
			"status":"done",
			"url":"img/tutorial/oldSlides/p02s1.png"
		},

		"header": {},
				
		"LRow1": {
			"wave": {
				"lpcLive": false,
				"lpcImg": "img/tutorial/waves/p02s1.svg",
				"labelTitle": "Image of an 'eee' Sound",
				"labelTxt": "(touch for audio)"
			}
		},
		
		"LRow2": {
			"items": [
				"<p class='p02s1-lr2-p1'>Its <span class='numbBub--white'> 1</span>st peak is all the way to the left,</p>",
				"<p class='p02s1-lr2-p2'>its <span class='numbBub--blueDark'>2</span>nd peak is pretty far to the right,</p>",
				"<p class='p02s1-lr2-p3'>and its <span class='numbBub--yellowMain'>3</span>rd peak is even further to the right.</p>"
			]
		},

		"RRow1": {
			"txtSquish": false,
			"items":[
				"<p>Here is a picture of my wave for an “eee” sound.</p>"
			]
		},

		"pic": {},
		
		"input": {
			"txt":"Next",
			"next": "p02s2"
		}
	},

	{
		"idx": 1,
		"sref": "p02s2",
		"coinRef":"p02",
		"nav": {
			"id": "p02s2",
			"page": 2,
			"pagetxt": "p02",
			"scene": 2,
			"scenetxt": "s2"
		},

		"template":"waveDouble.html",
		
		"bgImg": {
			"status":"done",
			"url":"img/tutorial/oldSlides/p02s2.png"
		},

		"LRow1": {
			"wave": {
				"lpcLive": false,
				"lpcImg": "img/tutorial/waves/eeeWave.svg",
				"labelTitle": "Image of an 'eee' Sound",
				"labelTxt": "(touch for audio)"
			}
		},
		
		"LRow2": {
			"lpc": true,
			"labelTitle": "Your Speech Wave"
		},

		"LRow2": {
			"wave": {
				"lpcLive": true,
				"labelTitle": "Your Speech Wave"
			}
		},

		"RRow1": {
			"txtSquish": false,
			"items":[
				"<p class='txt-boldBlueDark--try'>Now you try!</p>",
				"<p>How does your wave look when you <span class='txtBold'>say 'eee'?</p>"
			]
		},

		"pic": {
			"imgAbs": false,
			"img":"img/tutorial/starMic.png",
			"h": "260px",
			"w": "265px",
			"top": "5px",
			"left":"0px"
		},
		
		"input": {
			"txt":"Next",
			"next": "p03s1"
		}
	}
]