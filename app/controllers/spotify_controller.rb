require 'dotenv'
require 'json'
require "uri"
require 'rspotify'

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
    # client_id = ENV["SPOTIFY_CLIENT_ID"]
    # client_secret = ENV["SPOTIFY_CLIENT_SECRET"]
    # RSpotify.authenticate(client_id, client_secret)

    # spotify_user = RSpotify::User.new(request.env['omniauth.auth'])

    # puts spotify_user.country

    access_token = ENV["ACCESS_TOKEN"]
    # auth = {"Authorization": "Bearer #{access_token}"}
    auth1 = 'Bearer ' + access_token

    user_id = getUserID

    data = {
      "name": "New Playlist",
      # "description": "New playlist description",
      "public": true
    }
 
    url = 'https://api.spotify.com/v1/users/'+ user_id +'/playlists'

    puts url

    response = RestClient.post(url, header={Authorization: auth1}, data=data)

    #   {
    #   "name": "New Playlist",
    #   # "description": "New playlist description",
    #   "public": true}

    # url = 'https://api.spotify.com/v1/users/'+user_id+'/playlists'

    # response = RestClient::Request.new({
    # method: :post,
    # url: url,
    # headers: {content_type: 'application/json', Authorization: auth1},
    # data: data,
    # dadad: 'dada'
    # }).execute
    # end
    data1 = JSON.parse(response)
    render json: data1
    
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