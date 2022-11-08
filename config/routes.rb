Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  get '/home', to: 'home#index'
  
  get '/about', to: 'about#index'

  get "/tracks", to: 'spotify#top_tracks'

  post "/tracks", to: 'tracks#top_tracks'
  
  get "/events", to: 'event#events'
  
  get "/event/:id", to: 'event#event'
  
  get "/artist", to: 'artist#artist'

  get "/artists", to: 'spotify#getArtistIDs'

  get "/artistInfo", to: 'spotify#getArtistInfo'

  post "/artistInfo", to: 'spotify#getArtistInfo'

  get "/searchevents", to: 'event#searchEvents'

  get "/authorize", to: 'spotify#authorize'

  get "/user", to: 'spotify#getUserID'

  post "/playlist", to: 'spotify#createPlaylist'

  post "/addtracks", to: 'spotify#addTracksToPlaylist'

  post "/genPlay", to: 'spotify#eventPlaylistGenerator'

  namespace :api do # /api/data

    get '/data', to: 'tests#index'
    
    resources :dogs

  end

  get '*path', to: "static_pages#fallback_index_html", constraints: ->(request) do
    !request.xhr? && request.format.html?
  end

end
