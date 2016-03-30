/*
example call:  http://127.0.0.1:5100/artists/get?artist=u2

*/

var http = require('http'),
	request = require('request'),
	util = require('util'),
	express = require('express'),
    bodyParser = require('body-parser'), // npm install body-parser
    async = require('async')
	;
	
var PORT = 5100;
var spotifyAPI ='https://api.spotify.com/v1';
var echoNestAPI = "http://developer.echonest.com/api/v4";
var echoNestDeveloperKey = "0B3N8LMO4XG3BXPSY";

var app = express()
           .use(bodyParser.urlencoded({  extended: true}))
		   .get('/artists/:artistName', function(req,res){ 
		      var artistName = req.query['artist'];	// to retrieve value of query parameter called artist (?artist=someValue&otherParam=X)
		      handleArtists(req, res, artistName);
	        })
		   .get('/', function (req, res) {
              console.log('request received: '+request.url);
              res.writeHead(200, {'Content-Type': 'text/html'});
              res.write("Artist Enricher API - No Data Requested, so none is returned");
              res.write("Try something like http://127.0.0.1:5100/artists/get?artist=madonna");
              res.end();
            })
		   .listen(PORT);

console.log('server running on port ',PORT);


function composeArtisResponse(res, artist) {
  res.statusCode =200;
  res.send(JSON.stringify(artist));
}//composeArtisResponse

function handleArtists(req, res, artistName) {
      var artist ={}; // artist record that will be constructed bit by bit
      async.parallel([
	  // first function: call out to Spotify
	  function(callback){
	    util.log('Start Spotify Call');
        var artistUrl = spotifyAPI + '/search?q='+encodeURI(artistName)+'&type=artist'; // use encodeURI to handle special characters in the name in the proper way
        // invoke Spotify Search API to find the Artist and the spotify identifier; the response brings in genres and an image url 
        request( artistUrl, function handleSpotifySearchResponse(error, response, body) {  
        if (!error && response.statusCode == 200) {
          var artistsResponse = JSON.parse(body);
	      // if the artist has not been found, return immediately	  
	      if (artistsResponse.artists.total==0) {
             callback(null,'not found');
	      }// if artist not found
	  
        // else continue processing with spotify response
        artist.spotifyId = artistsResponse.artists.items[0].id;
        artist.name = artistsResponse.artists.items[0].name;
        artist.genres = JSON.stringify(artistsResponse.artists.items[0].genres);
	    if (artistsResponse.artists.items[0].images.length>0) {
          artist.imageURL = artistsResponse.artists.items[0].images[0].url;
        }
        artist.spottiyHRef = artistsResponse.artists.items[0].href;
	    util.log('Finished Spotify Call');
		
        callback(null, 'one');
		}
		});
      },
	  // second function: call out to EchoNest
      function(callback){
	     util.log('Start EchoNest Call');
        // get artist biography from EchoNest in two steps - first get echonestArtistId, then using that id, get the biography
	    var searchURL = echoNestAPI+ "/artist/search";
	    var biographiesURL = echoNestAPI+ "/artist/biographies";
        request(searchURL + '?api_key='+echoNestDeveloperKey+'&format=json&name='+encodeURI(artistName)+'&results=1', function (error, response, body) {  
	      // process response from EchoNest, to get the EchoNestArtistId
          if (!error && response.statusCode == 200) {
            var echonestSearchResponse = JSON.parse(body);
            var echonestArtistId = echonestSearchResponse.response.artists[0].id;
		    artist.echonestArtistId = echonestArtistId;
	        // with id under our belt, time to get the biography
		    var bioURL = biographiesURL + '?api_key='+echoNestDeveloperKey+"&id="+echonestArtistId
				                                    +'&format=json&results=1&start=0&license=cc-by-sa';
            request(bioURL, function (error, response, body) {  
              if (!error && response.statusCode == 200) {
                var echonestBioSearchResponse = JSON.parse(body);
                var bio = echonestBioSearchResponse.response.biographies[0].text;
    		    artist.biography = bio;
		      }// if !error
	          util.log('Finished EchoNest Call');
		      callback(null, 'two'); // notify ASYNC that this task is complete
	        });// request for bio		 
		  }// if !error in 1st response from echoNest
		  else {
	        callback(null, 'echonest issue'); // notify ASYNC that this task is complete
		  }
	    });// request echonest search plus callback
      }
], function(err, results){
    console.log("done with processing "+JSON.stringify(results));
    // take the artist record as it stands right now and compose the response
	composeArtisResponse(res, artist);
});



 } //handleArtists


