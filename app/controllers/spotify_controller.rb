require 'dotenv'
require 'json'
require 'uri'
require 'net/http'

Dotenv.load

class SpotifyController < ApplicationController
  @access_token = ENV["ACCESS_TOKEN"]
  @auth = {"Authorization": "Bearer #{@access_token}"}

  def getUserID
    access_token = ENV["ACCESS_TOKEN"]
    auth = {"Authorization": "Bearer #{access_token}"}

    endpoint1 = RestClient.get("https://api.spotify.com/v1/me", header=auth)

    data1 = JSON.parse(endpoint1)
    userID = data1["id"]
    # render json: userID
    return userID
  end

  def createPlaylist
    puts 'creating playlist'
    user_id = getUserID
    access_token = ENV["ACCESS_TOKEN"]


    url = "https://api.spotify.com/v1/users/#{user_id}/playlists"

    uri = URI.parse(url)

    request = Net::HTTP::Post.new(uri)
    request.content_type = "application/json"
    request["Accept"] = "application/json"
    request["Authorization"] = "Bearer #{access_token}"

    request.body = JSON.dump({
      "name" => "Test Playlist",
      "description" => "New playlist description",
      "public" => true
    })

    req_options = {
      use_ssl: uri.scheme == "https",
    }

    response = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
      http.request(request)
    end
    render json: response
  end

  def addCoverImage
    # playlist_id = "0103aYYzgGTxNnhywPvbQt"
    
  end

  def updateDetails
  end

  def addTracksToPlaylist
    access_token = ENV["ACCESS_TOKEN"]

    ## this should be an input
    playlist_id = "0103aYYzgGTxNnhywPvbQt"

    ## this should be an input for either artist_id or the top tracks
    uris =[
      "spotify:track:7IZJ77l62dgOeHwoKzJQTv",
      "spotify:track:2MrrxPBSQRYcuNfEeChkaR"
    ]

    uri = URI.parse("https://api.spotify.com/v1/playlists/#{playlist_id}/tracks")
    request = Net::HTTP::Post.new(uri)
    request.content_type = "application/json"
    request["Authorization"] = "Bearer #{access_token}"
    request["Content-Length"] = 49
    request.body = JSON.dump({
      "uris" => uris,
      "position" => 0
    })
    
    req_options = {
      use_ssl: uri.scheme == "https",
    }
    
    response = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
      http.request(request)
    end

    render json: response
  end

  def eventPlaylistGenerator
    # event details for playlist name
    eventName = params[:eventName]
    eventDate = params[:eventDate]

    # artist ids for event in array
    artistArr = 

    # create playlist using event name, date for name
    playlist_id = createPlaylist(eventName, eventDate)

    # populate playlist based on artists top tracks
    # get top tracks for artist
    top_tracks = getTopTracks(artist_id)
    # input into playlist 
    addTracksToPlaylist(playlist_id, top_tracks)

  end
  # def followPlaylist
  # end

  def getArtistInfo
    access_token = ENV["ACCESS_TOKEN"]
    auth = {"Authorization": "Bearer #{access_token}"}

    puts auth
    artist_name = 'Dalek One'

    endpoint1 = RestClient.get("https://api.spotify.com/v1/search?q=#{artist_name}&type=artist&limit=1", headers=auth)
    # endpoint1 = RestClient.get("https://api.spotify.com/v1/artists/#{artist_id}", headers=auth)

    data1 = JSON.parse(endpoint1)
    artistURI = data1["artists"]["items"]
    render json: artistURI
  end

end