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
    render json: @event_info

    # map response event info to database models
    # for each item in object array
      # add event id to events, add all event info to table
  end

  def event
    id = params[:id]
    render json: id
    # @event = Event.joins("join gigs on gigs.event_id = events.id").joins("join artists on gigs.artist_id = artists.id").where(events: {id: id}).select("artists.name as artist_name, events.name as event_name, events.date as event_date, artists.id as artist_id")
    # render json: @event
  end

end