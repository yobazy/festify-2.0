require 'dotenv'
require 'json'
Dotenv.load

class SpotifyController < ApplicationController
  @access_token = ENV["ACCESS_TOKEN"]
  @auth = {"Authorization": "Bearer #{@access_token}"}

  def getUserID
    access_token = ENV["ACCESS_TOKEN"]
    auth = {"Authorization": "Bearer #{access_token}"}

    endpoint1 = RestClient.get("https://api.spotify.com/v1/me", headers=auth)

    data1 = JSON.parse(endpoint1)
    userID = data1["id"]
    return userID
  end

  def createPlaylist
    user_id = getUserID

    # endpoint1 = RestClient.get("https://api.spotify.com/v1/search?q=#{artist_name}&type=artist&limit=1", headers=auth)
    endpoint1 = RestClient.post("https://api.spotify.com//v1/users/#{user_id}/playlists", headers=auth)

    data1 = JSON.parse(endpoint1)
    render json: data1
  end

  def addCoverImage
  end

  def updateDetails
  end

  def addTracks
  end

  def followPlaylist
  end

end