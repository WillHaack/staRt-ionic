/* THIS IS JUST A REFERENCE SHEET */

// base 
	{
		"idx": 0,
		"sref": "p01s1",
		"coinRef":"p01",
		"nav": {
			"id": "p01s1",
			"page": 1,
			"scene": 1,
		},

		"template":"tutPartial_default.html",
		// "waveNone.html",  "waveSingle.html",  "waveDouble.html",  "imgTemplate.html",
		
		"bgImg": {
			//"status": "toDo" || "dim" || "done",
			"url":"img/tutorial/oldSlides/p01s1.png"
		},

		"input": {
			"txt":"Let's go!",
			"next": "p01s2"
		}
	}


// single wave
		"header": {
			"txt": ""
		},

		"LRow1": {
			"wave": {
				"lpcLive": true/false,
				"lpcImg": "img/tutorial/waves/goodRwave.svg",
				"labelTitle": "Image of Good /R/",
				"labelTxt": "(touch for audio)"
			},
			"items": [
				"<p></p>",
				"<p></p>",
				"<p></p>"
			]
		},
		
		"LRow2": {
			"wave": {
				"lpcLive": true || false,
				"lpcImg": "img/tutorial/waves/goodRwave.svg",
				"labelTitle": "Image of Good /R/",
				"labelTxt": "(touch for audio)"
			},
			"items": [
				"<p></p>",
				"<p></p>",
				"<p></p>"
			]
		},
		
		"RRow1": {
			"txtSquish": false,
			"items":[
				"<p></p>",
				"<p></p>",
				"<p></p>",
				"<div class='spacer'> </div>"
			]
		},

		"pic": {
			"imgAbs": false,
			"img":"img/tutorial/starMic.png",
			"h": "260px",
			"w": "265px",
			"top": "0px",
			"left": "0px"
		}

		// "star": {
		// 	"img":"img/tutorial/starMic.png",
		// 	"hgt": "260px",
		// 	"w": "265px",
		// 	"top": "5px",
		// 	"left":""
		// },

// double wave


// no wave
		"header": {
			"txt": "HELLO! <p>This tutorial will show you how to use the staRt wave to practice your 'r' sounds.</p>"
		},
		
		"LRow1": {
			"wave": {
				"lpc": true/false,
				"lpcImg": "img/tutorial/waves/goodRwave.svg",
				"labelTitle": "Image of Good /R/",
				"labelTxt": "(touch for audio)"
			},
			"items": []
		},
		
		
		"LRow2": {
			"txt": ""
		},
		
		"LRow3": {
			"txt":""
		},
		
		"char": {
			"img":"img/tutorial/char-p01s1.png",
			"hgt": "330px",
			"w": "316px",
			"top": "145px",
			"left":"505px"
		},

