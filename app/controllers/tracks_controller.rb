require 'dotenv'
require 'json'
require 'rest-client'
Dotenv.load

class TracksController < ApplicationController
  
  def top_tracks
    access_token = ENV["ACCESS_TOKEN"]
  
    auth = {"Authorization": "Bearer #{access_token}"}

    artist_id = '7guDJrEfX3qb6FEbdPA5qi'

    endpoint1 = RestClient.get("https://api.spotify.com/v1/artists/#{artist_id}/top-tracks?market=CA", headers=auth)

    data1 = JSON.parse(endpoint1)
    render json: data1
  end

end
