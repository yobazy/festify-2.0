require 'dotenv'
require 'json'
require 'rspotify'
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
    
  end

  def addCoverImage
  end

  def updateDetails
  end

  def addTracks
    access_token = ENV["ACCESS_TOKEN"]
    
    auth = {"Authorization": "Bearer #{access_token}"}

    response = RestClient.get("https://api.spotify.com/v1/users/#{user_id}/playlists/#{playlist_id}/tracks?uris=#{uris}
    ", header=auth)

    data1 = JSON.parse(response)
    
    render json: data1

  end

  def followPlaylist
  end

end