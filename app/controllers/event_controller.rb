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

    @response =  RestClient.get "https://edmtrain.com/api/events?events?startDate=2022-07-01&endDate=2022-07-10&locationIds=69&client=#{api_key}",
    {content_type: :json, accept: :json}

    @event_info = JSON.parse(@response.body)
    render json: @event_info
  end
end
