class EventController < ApplicationController
  def index
    render :json => {
      message: "Shamb so gooooooood! 2 MORE WEEKS!"
    }
  end
end
