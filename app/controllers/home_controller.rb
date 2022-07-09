class HomeController < ApplicationController
  def index
    render :json => {
      message: 'Click the button to load data!'
    }
  end
end
