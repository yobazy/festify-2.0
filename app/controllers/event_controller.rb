require 'dotenv'
require 'json'
Dotenv.load

class EventController < ApplicationController
  def index
    render :json => {
      message: "Shamb so gooooooood! 2 MORE WEEKS!"
    }
  end

  def events 
    api_key = ENV["EDMTRAIN_API_KEY"]
    url = "https://edmtrain.com/api/events?events?startDate=2022-07-20&endDate=2023-07-25&livestreamInd=false&locationIds=5&festivalInd=true&client=#{api_key}"
    
    @response = RestClient::Request.execute(method: :get, url: url, headers: headers, verify_ssl: false)

    @event_info = JSON.parse(@response.body)
    # puts @event_info["data"]

    # map response event info to database models
    # for each event 
    @event_info["data"].each { |event| 
      # add event id to events, add all event info to table
      e = Event.create(edmtrain_event_id: event["id"], name: event["name"], date: event["date"], location: event["venue"]["location"])

        # for each artist for event, add to artist table and gig table
        artList =  event["artistList"]
        puts event["id"]
        artList.each  { |artist| 
          a = Artist.create(edmtrain_artist_id: artist["id"], name: artist["name"])
          puts artist["id"]
          g = Gig.create(artist_id: artist["id"], event_id: event["id"])
      }
    }
    
    render json: @event_info

  end

  def event
    id = params[:id]
    render json: id

    # look up event name and information from events table

    # lookup artists based on event id from artists table

    # @event = Event.joins("join gigs on gigs.event_id = events.id").joins("join artists on gigs.artist_id = artists.id").where(events: {id: id}).select("artists.name as artist_name, events.name as event_name, events.date as event_date, artists.id as artist_id")
    # render json: @event
  end

end