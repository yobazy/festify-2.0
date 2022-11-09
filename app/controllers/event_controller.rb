require 'dotenv'
require 'json'
Dotenv.load

class EventController < ApplicationController
  def getEvents
    events = Event.all
    puts events
    render json: events
    return events
  end

  def getEvent
    puts 'get Event called!'
    event_id = params[:id]
    puts event_id
    # event = Event.find_by(edmtrain_event_id: event_id)
    render json: event_id

    # look up event name and information from events table
    # get 

    # lookup artists based on event id from artists table
    # find artist_ids from gigs table
      # get artistIDs where event_id == id

    # find artist_information from artist table based on artist_ids


    # @event = Event.joins("join gigs on gigs.event_id = events.id").joins("join artists on gigs.artist_id = artists.id").where(events: {id: id}).select("artists.name as artist_name, events.name as event_name, events.date as event_date, artists.id as artist_id")

    # render json: @event
  end

end