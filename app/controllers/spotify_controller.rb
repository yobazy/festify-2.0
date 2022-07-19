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

  def addTracks
    access_token = ENV["ACCESS_TOKEN"]

    uri = URI.parse("https://api.spotify.com/v1/playlists/0103aYYzgGTxNnhywPvbQt/tracks")
    request = Net::HTTP::Post.new(uri)
    request.content_type = "application/json"
    request["Authorization"] = "Bearer #{access_token}"
    request["Content-Length"] = 49
    request.body = JSON.dump({
      "uris" => [
        "spotify:track:7IZJ77l62dgOeHwoKzJQTv",
        "spotify:track:2MrrxPBSQRYcuNfEeChkaR"
      ],
      "position" => 0
    })
    
    req_options = {
      use_ssl: uri.scheme == "https",
    }
    
    response = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
      http.request(request)
    end

  end











    # puts 'adding tracks'
    # uris = ["spotify:track:7IZJ77l62dgOeHwoKzJQTv", "spotify:track:5PEwMWC5koD2OTNblKT6f0"]
    # playlist_id = "0103aYYzgGTxNnhywPvbQt"
    
    # url = "https://api.spotify.com/v1/playlists/#{playlist_id}/tracks?"

    # uri = URI.parse("https://api.spotify.com/v1/playlists/0103aYYzgGTxNnhywPvbQt/tracks?uris=spotify%3Atrack%3A7IZJ77l62dgOeHwoKzJQTv")
    # request = Net::HTTP::Post.new(uri)
    # request.content_type = "application/json"
    # request["Accept"] = "application/json"
    # request["Authorization"] = "Bearer BQDNlESf80vpnktay2wRT85tng2nXyXK1AyIcHlyujpuMFvOyLlJs3IO2UHp9cbhFj9E6yoq229TVZMpgrIKqbXZt9ACmukBghE23MLOPu7ZjR4-0KHsPzP9tSjlQ8oCHXwyudYb10FLmhZI0M2pCb4QcwiFxrGuwEIJRPuXRPKXS3D2NN88bLH-wzDLNSoKU5kATiuYIBQmtPKzgBLIyMbtukQz0HWpWYmkJhcPazVOsPmC"

    # req_options = {
    #   use_ssl: uri.scheme == "https",
    # }

    # response = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
    #   http.request(request)
    # end 
    # # data1 = JSON.parse(resonse)
    # render json: response
    # # uri = URI.parse(url)
    # # request = Net::HTTP::Post.new(uri)
    # # request.content_type = "application/json"
    # # request["Authorization"] = ""
    # # request.body = JSON.dump({
    # #   "uris" => [
    # #     "spotify:track:7IZJ77l62dgOeHwoKzJQTv"
    # #   ],
    # #   "position" => 0
    # # })

    # # req_options = {
    # #   use_ssl: uri.scheme == "https",
    # # }

    # # response = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
    # #   http.request(request)
    # # end

  def followPlaylist
  end

end