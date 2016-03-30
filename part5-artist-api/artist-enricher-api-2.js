/*
example call:  http://127.0.0.1:5100/artists/get?artist=u2

*/

var http = require('http'),
	request = require('request'),
	express = require('express'),
    bodyParser = require('body-parser') // npm install body-parser
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
  
  var artistUrl = spotifyAPI + '/search?q='+encodeURI(artistName)+'&type=artist'; // use encodeURI to handle special characters in the name in the proper way
  // invoke Spotify Search API to find the Artist and the spotify identifier; the response brings in genres and an image url 
  request( artistUrl, function handleSpotifySearchResponse(error, response, body) {  
    if (!error && response.statusCode == 200) {
      var artistsResponse = JSON.parse(body);
      var artist ={}; // artist record that will be constructed bit by bit

	  // if the artist has not been found, return immediately	  
	  if (artistsResponse.artists.total==0) {
	    res.status(200).send(JSON.stringify(artist));
		return;
	  }// if artist not found
	  
      // else continue processing with spotify response
      artist.spotifyId = artistsResponse.artists.items[0].id;
      artist.name = artistsResponse.artists.items[0].name;
      artist.genres = JSON.stringify(artistsResponse.artists.items[0].genres);
	  if (artistsResponse.artists.items[0].images.length>0) {
        artist.imageURL = artistsResponse.artists.items[0].images[0].url;
      }
      artist.spottiyHRef = artistsResponse.artists.items[0].href;
      // get artist biography from EchoNest
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
              // take the artist record as it stands right now and compose the response
     	      composeArtisResponse(res, artist);
		    }// if !error
	      });// request for bio
		 
		}// if !error in 1st response from echoNest
	  });// request echonest search plus callback

    }// if !error in Spotify response
  }); // request Spotify and callback 
} //handleArtists


