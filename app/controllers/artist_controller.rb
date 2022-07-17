require 'dotenv'
require 'json'
require 'rest-client'
Dotenv.load

class ArtistController < ApplicationController
  
  # get top 10 tracks for artist
  def artist
    access_token = ENV["ACCESS_TOKEN"]
  
    auth = {"Authorization": "Bearer #{access_token}"}

    # artist_name = 'Stevie Wonder'

    artist_id = '7guDJrEfX3qb6FEbdPA5qi'

    # endpoint1 = RestClient.get("https://api.spotify.com/v1/search?q=#{artist_name}&type=artist&limit=1", headers=auth)
    endpoint1 = RestClient.get("https://api.spotify.com/v1/artists/#{artist_id}", headers=auth)

    data1 = JSON.parse(endpoint1)
    render json: data1
  end
end
