'use strict';

var csvdata = "Word,C_or_V,Length,Complexity,Backness,Category,Target,Subcategory,Image\nrude,C,1_syll,simple,back,consonantal_back,Ru,,rude.jpg\nrose,C,1_syll,simple,back,consonantal_back,Ro,,rose.jpg\nraw,C,1_syll,simple,back,consonantal_back,Ra,,raw.jpg\nrob,C,1_syll,simple,back,consonantal_back,Ra,,rob.jpg\nrug,C,1_syll,simple,back,consonantal_back,Ra,,rug.jpg\nrace,C,1_syll,simple,front,consonantal_front,Re,,race.jpg\nraft,C,1_syll,simple,front,consonantal_front,Re,,raft.jpg\nreach,C,1_syll,simple,front,consonantal_front,Ri,,reach.jpg\nride,C,1_syll,simple,front,consonantal_front,Ry,,ride.jpg\nred,C,1_syll,simple,front,consonantal_front,Re,,red.jpg\nturn,V,1_syll,simple,all,schwar,VS,,turn.jpg\nworm,V,1_syll,simple,all,schwar,VS,,worm.jpg\nhammer,V,2_syll,simple,all,schwar,VU,,hammer.jpg\nladder,V,2_syll,simple,all,schwar,VU,,ladder.jpg\nnurse,V,1_syll,simple,all,schwar,VS,,nurse.jpg\nscarf,V,1_syll,simple,back,vocalic_back,Dar,,scarf.jpg\nsword,V,1_syll,simple,back,vocalic_back,Dor,,sword.jpg\ndark,V,1_syll,simple,back,vocalic_back,Dar,,dark.jpg\nfork,V,1_syll,simple,back,vocalic_back,Dor,,fork.jpg\nfarm,V,1_syll,simple,back,vocalic_back,Dar,,farm.jpg\nbeard,V,1_syll,simple,front,vocalic_front,Dir,,beard.jpg\nweird,V,1_syll,simple,front,vocalic_front,Dir,,weird.jpg\nchair,V,1_syll,simple,front,vocalic_front,Der,,chair.jpg\nclear,V,1_syll,simple,front,vocalic_front,Dir,,clear.jpg\nstare,V,1_syll,simple,front,vocalic_front,Der,,stare.jpg";

function parseCSV(str) {
    var arr = [];
    var quote = false;  // true means we're inside a quoted field

    // iterate over each character, keep track of current row and column (of the returned array)
		var row=0, col=0, c=0;
    for (; c < str.length; c++) {
        var cc = str[c], nc = str[c+1];        // current character, next character
        arr[row] = arr[row] || [];             // create a new row if necessary
        arr[row][col] = arr[row][col] || '';   // create a new column (start with empty string) if necessary

        // If the current character is a quotation mark, and we're inside a
        // quoted field, and the next character is also a quotation mark,
        // add a quotation mark to the current column and skip the next character
        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }

        // If it's just one quotation mark, begin/end quoted field
        if (cc == '"') { quote = !quote; continue; }

        // If it's a comma and we're not in a quoted field, move on to the next column
        if (cc == ',' && !quote) { ++col; continue; }

        // If it's a newline and we're not in a quoted field, move on to the next
        // row and move to column 0 of that new row
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }

        // Otherwise, append the current character to the current column
        arr[row][col] += cc;
    }
    return arr;
}

( function(  )
{
	var words = angular.module( 'words',
	[ ] );

	words.config( function( $stateProvider )
	{
		// var wordurl = "../../../data/staRt_wordlist.csv";
		// var csvwords = $http.$get(wordurl).then(function(response){
	  //    return parseCSV(response.data);
	  // });

		var wordarray = parseCSV(csvdata).slice(1).map(function(w) {return w[0];});

		$stateProvider.state( 'root.words',
		{
			url: 'words',
			views:
			{
				'content-view':
				{
					templateUrl: 'states/root/words/words_template.html',
					controller: 'WordsController as words'
				}
			},
			resolve:
			{
				wordList: function() {return wordarray;}
			}
			// abstract: true,
		} );
	} );

} )(  );
