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
	  // execute sequential asynchronous calls to functions as waterfall
	  async.waterfall([
        function(callback) {
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
              callback(null, artist.spotifyId);
		    }//!error in spotify search
		  });// request
        }, // go collect list of albums by this artist
        function(artistSpotifyId, callback) {
          /* now get discography - the most recent 50 albums (the maximum we can collect in one call)
   	         https://api.spotify.com/v1/artists/3WrFJ7ztbogyGnTHbHJFl2/albums?limit=50&album_type=album	  
	       */
	      var albumsURL = spotifyAPI + '/artists/'+artistSpotifyId+'/albums'+'?limit=50&album_type=album';
	      artist.albums=[];
          request(albumsURL, function (error, response, body) {  	  
            var albumsResponse = JSON.parse(body);
		    for (var i = 0; i < albumsResponse.items.length; i++) {
              var album = {};
		      album.title = albumsResponse.items[i].name;
		      if (albumsResponse.items[i].images.length > 0) {
		        album.imageURL = albumsResponse.items[i].images[0].url;
		      }
		      album.spotifyId = albumsResponse.items[i].id;
		      artist.albums.push(album);
            };// for loop over albums
            callback(null, artist.albums);
		  });//request     },
		},  // go get details on the albums in the list artist.albums
        function(albums, callback) {
		  var albumsDetailsURL = spotifyAPI + '/albums/?ids=';
	      var albumArrays = [];
          var i,j,chunk = 15;
		  // create albumArrays with no more than 15 album ids in each of them
          for (i=0,j=albums.length; i<j; i+=chunk) {
   	        albumArrays.push(albums.slice(i,i+chunk));
          }
          // parallel execution of each of the album arrays - note: we can invoke the albumDetailsURL with a maximum number of album id values per call
	      async.forEachOf(albumArrays, function (value, key, callback) {
              var albumsDetailsURL = spotifyAPI + '/albums/?ids=';
			  // concatenate album id's together
	          for (var i = 0; i < value.length ; i++) {
	             albumsDetailsURL+= (i>0?',':'')+value[i].spotifyId;
	          }//for 
		      // invoke REST API to retrieve details for a set of albums
 		      request(albumsDetailsURL, function (error, response, body) {  	  
                 var albumDetailsResponse = JSON.parse(body);
     	         for (var i = 0; i < albumDetailsResponse.albums.length ; i++) {
		           // clumsy way to correct for incomplete release dates (year only for example)
	               albums[(i+ key* chunk)].releaseDate= 
			           ( albumDetailsResponse.albums[i].release_date_precision =='day'
			           ? albumDetailsResponse.albums[i].release_date
			           : albumDetailsResponse.albums[i].release_date+'-01-01'
			           );
	             }// for
			    // return the fact that this albumArray is done - up to forEachOf
                callback();       
	  	      }); //request
          }, function (err) { // completion of the forEachOf
	          // after the asynch.forEachOf, when all branches have done their callback()
			  // done with all parallel processing; notify the top level (waterfall) that we are done here
               callback(null, albums);
		     }	 
          );// forEachOf						  
        }
      ],function (err, result) {// completion of waterfall
          // result now equals 'done'
    	  util.log('waterfall done');
	      util.log('Finished Two Spotify Calls');		
	      callback(null,'waterfall');
        }
	  );//waterfall	
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
		      callback(null, 'Echonest'); // notify ASYNC that this task is complete
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


