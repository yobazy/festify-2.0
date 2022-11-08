# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
require 'dotenv'
require 'json'
require 'rest-client'
Dotenv.load

def seed_events 
  api_key = ENV["EDMTRAIN_API_KEY"]

  url = "https://edmtrain.com/api/events?events?startDate=2022-07-&endDate=2022-08-25&livestreamInd=false&locationIds=5&festivalInd=true&client=#{api_key}"

  @response = RestClient::Request.execute(method: :get, url: url, verify_ssl: false)

  @events_info = JSON.parse(@response.body)

  @events_info["data"].map do |event|
    Event.create(id: event["id"], name: event["name"], date: event["date"], location: event["venue"]["location"])
    event["artistList"].map do |artist|
      Artist.create(id: artist["id"], name: artist["name"])
      Gig.create(event_id: event["id"], artist_id: artist["id"])
    end
  end
end

seed_events()

# @event_artist_excision = Artist.find_by(id: 258)

# puts "HELLO"
# puts @event_artist_excision.name

# def seed_artist_spotify_id
#   access_token = ENV["ACCESS_TOKEN"]

#   auth = {"Authorization": "Bearer #{access_token}"}

 

#   endpoint1 = RestClient.get("https://api.spotify.com/v1/search?q=#{artist_name}&type=artist&limit=1", headers=auth)

#   data1 = JSON.parse(endpoint1)
#   render json: data1
# end