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
    url = "https://edmtrain.com/api/events?events?startDate=2022-07-&endDate=2022-08-25&livestreamInd=false&locationIds=5&festivalInd=true&client=#{api_key}"

    # @response =  RestClient.get "https://edmtrain.com/api/events?events?startDate=2022-07-01&endDate=2022-07-10&locationIds=69&client=#{api_key}",
    # {content_type: :json, accept: :json, verify_ssl: false}
    
    @response = RestClient::Request.execute(method: :get, url: url, headers: headers, verify_ssl: false)

    @event_info = JSON.parse(@response.body)
    render json: @event_info
  end
end