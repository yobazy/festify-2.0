Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  get '/home', to: 'home#index'
  
  get '/about', to: 'about#index'

  
  get "/artists", to: 'artist#artists'
  

    get "/events", to: 'event#events'

    get "/events/:id", to: 'event#event'


  namespace :api do # /api/data

    get '/data', to: 'tests#index'
    
    resources :dogs

  end

  get '*path', to: "static_pages#fallback_index_html", constraints: ->(request) do
    !request.xhr? && request.format.html?
  end

end
