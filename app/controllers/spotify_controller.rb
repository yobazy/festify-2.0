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
    render json: userID
    return userID
  end

  def createPlaylist
    # client_id = ENV["SPOTIFY_CLIENT_ID"]
    # client_secret = ENV["SPOTIFY_CLIENT_SECRET"]
    # RSpotify.authenticate(client_id, client_secret)

    # spotify_user = RSpotify::User.new(request.env['omniauth.auth'])

    # puts spotify_user.country



    access_token = ENV["ACCESS_TOKEN"]
    auth = {"Authorization": "Bearer #{access_token}"}

    user_id = getUserID

    data = {
      "name": "New Playlist",
      # "description": "New playlist description",
      "public": true
    }

    headers = {
      "Authorization": "Bearer #{access_token}"
    }
 
    endpoint1 = RestClient.post("https://api.spotify.com/v1/users/#{user_id}/playlists", headers=auth)

    data1 = JSON.parse(endpoint1)
    render json: data1
  end

  def addCoverImage
  end

  def updateDetails
  end

  def addTracks
    access_token = ENV["ACCESS_TOKEN"]
    auth = {"Authorization": "Bearer #{access_token}"}

    playlist_id = "6l9KdWDlnALLTPq35hi8Y7"

    uris = ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh","spotify:track:1301WleyT98MSxVHPZCA6M", "spotify:episode:512ojhOuo1ktJprKbVcKyQ"]

    data = {
      "uris": uris
      }

    url = "https://api.spotify.com/v1/playlists/#{playlist_id}/tracks"

    endpoint1 = RestClient.post("https://api.spotify.com/v1/playlists/#{playlist_id}/tracks", headers=auth, data=data)

    data1 = JSON.parse(endpoint1)
    render json: data1

  end

  def followPlaylist
  end

end