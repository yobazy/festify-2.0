require 'dotenv'
require 'json'
require 'rest-client'
Dotenv.load

class TracksController < ApplicationController
  
  def top_tracks
    access_token = ENV["ACCESS_TOKEN"]
  
    auth = {"Authorization": "Bearer #{access_token}"}

    artist_name = params[:data]

    puts artist_name

    artist = Artist.find_by(name: "#{artist_name}")

    artist_id = artist.spotify_artist_id

    endpoint1 = RestClient.get("https://api.spotify.com/v1/artists/#{artist_id}/top-tracks?market=CA", headers=auth)

    data1 = JSON.parse(endpoint1)
    render json: data1
  end

end
