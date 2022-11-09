# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
require 'dotenv'
require 'json'
require 'rest-client'
Dotenv.load

  # seed databases with events API call
  def seedEvents 
    api_key = ENV["EDMTRAIN_API_KEY"]
    start_date = "2022-07-20"
    end_date = "2023-07-25"

    url = "https://edmtrain.com/api/events?events?startDate=#{start_date}&endDate=#{end_date}&livestreamInd=false&locationIds=5&festivalInd=true&client=#{api_key}"
    
    @response = RestClient::Request.execute(method: :get, url: url, headers: headers, verify_ssl: false)

    @event_info = JSON.parse(@response.body)
    # puts @event_info["data"]

    # map response event info to database models
    # for each event from search
    @event_info["data"].each { |event| 
      # check if event exists in db 
      # if event["id"] is NOT in Events table under edmtrain_event_id 

      # add event id to events, add all event info to table
      e = Event.create(edmtrain_event_id: event["id"], name: event["name"], date: event["date"], location: event["venue"]["location"])

        # for each artist for event, add to artist table and gig table
        artList =  event["artistList"]
        puts event["id"]
        artList.each  { |artist| 
          # if edmtrain_artist_id does not exist in table
          # create entry in artist table
          a = Artist.create(edmtrain_artist_id: artist["id"], name: artist["name"])

          # create gig table entry
          puts 'artist_id' 
          puts artist["id"]

          puts 'event_id'
          puts event["id"]

          puts "creating gig table entry"
          g = Gig.create(artist_id: artist["id"], event_id: event["id"])
      }
    }
    
    render json: @event_info

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