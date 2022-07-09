class AboutController < ApplicationController
  def index
    render :json => {
      message: "This is the about page!"
    }
  end
end
