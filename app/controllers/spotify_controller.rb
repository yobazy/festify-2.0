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

  def followPlaylist
  end

end