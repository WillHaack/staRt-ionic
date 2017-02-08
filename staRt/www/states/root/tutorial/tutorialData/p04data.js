[
	{
		"idx": 0,
		"sref": "p04s1",
		"coinRef":"p04",
		"nav": {
			"id": "p04s1",
			"page": 4,
			"scene": 1
		},

		"template":"waveDouble.html",
		
		"bgImg": {
			"status": "done",
			"url":"img/tutorial/oldSlides/p04s1.png"
		},

		"LRow1": {
			"wave": {
				"lpcLive": false,
				"lpcImg": "img/tutorial/waves/oooWave.svg",
				"labelTitle": "Image of an 'ooo' Sound",
				"labelTxt": "(touch for audio)"
			}
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
				"<p>Here is my “ooo” wave.</p>",
				"<p>How does your wave look when you <span class='txtBold'>say “ooo”?</span></p>"
			]
		},
		
		"pic": {
			"imgAbs": false,
			"img":"img/tutorial/char-p04s1.png",
			"w": "319px",
			"h": "273px",
			"top": "-20px",
			"left":"-30px"
		},

		"input": {
			"txt":"Next",
			"stepDone": 3,
			"next": "p04s2"
		}
	},

	{
		"idx": 1,
		"sref": "p04s2",
		"coinRef":"p04",
		"nav": {
			"id": "p04s2",
			"page": 4,
			"scene": 2
		},

		"template":"waveDouble.html",
		
		"bgImg": {
			"status": "done",
			"url":"img/tutorial/oldSlides/p04s2.png"
		},

		"LRow1": {
			"wave": {
				"lpcLive": false,
				"lpcImg": "img/tutorial/waves/oooWaveCali.svg",
				"labelTitle": "California 'ooo' Sound",
				"labelTxt": "(touch for audio)"
			}
		},

		"LRow2": {
			"wave": {
				"lpcLive": false,
				"lpcImg": "img/tutorial/waves/oooWaveNY.svg",
				"labelTitle": "New York 'ooo' Sound",
				"labelTxt": "(touch for audio)"
			}
		},

		"RRow1": {
			"txtSquish": true,
			"items":[
				"<p class='txtBold'>Your wave might look different depending on where you are from.</p>",
				"<br />",
				"<p>For example, people from California and people from New York tend to have very different 'ooo' sounds.</p>"
			]
		},

		"pic": {
			"imgAbs": false,
			"img":"img/tutorial/char-p04s2.png",
			"h": "180px",
			"w": "320px",
			"top": "35px",
			"left":"-30px"
		},
		
		"input": {
			"txt":"Next",
			"stepDone": 4,
			"next": "p04s3"
		}
	},

	{
		"idx": 2,
		"sref": "p04s3",
		"coinRef":"p04",
		"nav": {
			"id": "p4s3",
			"page": 1,
			"scene": 3
		},

		"template":"imgTemplate.html",
		
		"bgImg": {
			"status": "toDo",
			"url":"img/tutorial/oldSlides/p04s3.png"
		},

		"pic": {
			"imgAbs": false,
			"img":"img/tutorial/char-p03s1.png",
			"h": "260px",
			"w": "265px",
			"top": "5px",
			"left":""
		},
		
		"input": {
			"txt":"Next",
			"stepDone": 4,
			"next": "p05s1"
		}
	}
]