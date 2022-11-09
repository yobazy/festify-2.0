require 'dotenv'
require 'json'
require 'uri'
require 'net/http'

Dotenv.load

class SpotifyController < ApplicationController
  @access_token = ENV["ACCESS_TOKEN"]
  @auth = {"Authorization": "Bearer #{@access_token}"}

  # implicit authorization flow
    # def authorize
  #  puts @access_token
  #  string_length = 16
  #  state = '1234123412341234'

  #  redirect_uri = 'http://localhost:8888/callback'
  #  client_id = 'CLIENT_ID'
  #  scope = 'user-read-private user-read-email';
    # state = generateRandomString(16)
    # localStorage.setItem(stateKey, state);

  #  url = 'https://accounts.spotify.com/authorize'
  #  url += '?response_type=token'
  #  url += '&client_id=' + URI.extract(client_id);
  #  url += '&scope=' + URI.extract(scope)
  #  url += '&redirect_uri=' + URI.extract(redirect_uri)
  #  url += '&state=' + URI.extract(state)

  #  puts url
  #end

  def getUserID
    access_token = ENV["ACCESS_TOKEN"]
    auth = {"Authorization": "Bearer #{access_token}"}

    endpoint1 = RestClient.get("https://api.spotify.com/v1/me", header=auth)

    data1 = JSON.parse(endpoint1)
    userID = data1["id"]
    # render json: userID
    return userID
  end

  def createPlaylist(name, date)
    puts 'creating playlist'
    user_id = getUserID
    access_token = ENV["ACCESS_TOKEN"]


    url = "https://api.spotify.com/v1/users/#{user_id}/playlists"

    uri = URI.parse(url)

    request = Net::HTTP::Post.new(uri)
    request.content_type = "application/json"
    request["Accept"] = "application/json"
    request["Authorization"] = "Bearer #{access_token}"

    request.body = JSON.dump({
      "name" => name+" "+date,
      "description" => "New playlist description",
      "public" => true
    })

    req_options = {
      use_ssl: uri.scheme == "https",
    }

    response = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
      http.request(request)
    end
    return response["location"]
    # return JSON.parse(response)
  end

  def addCoverImage
    # playlist_id = "0103aYYzgGTxNnhywPvbQt"
    
  end

  def updateDetails
  end

  def addTracksToPlaylist(tracks, playlist_id)
    puts 'adding tracks'
    access_token = ENV["ACCESS_TOKEN"]

    ## this should be an input
    # playlist_id = "0103aYYzgGTxNnhywPvbQt"

    ## this should be an input for either artist_id or the top tracks
    uris = tracks
    puts uris
    puts playlist_id

    uri = URI.parse("https://api.spotify.com/v1/playlists/#{playlist_id}/tracks")
    request = Net::HTTP::Post.new(uri)
    request.content_type = "application/json"
    request["Authorization"] = "Bearer #{access_token}"
    request["Content-Length"] = 49
    request.body = JSON.dump({
      "uris" => uris,
      "position" => 0
    })
    
    req_options = {
      use_ssl: uri.scheme == "https",
    }
    
    response = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
      http.request(request)
    end
  end

  def eventPlaylistGenerator
    # event details for playlist name
    event_name = 'Chasing Summer'
    # eventName = params[:eventName]
    event_date = '2022-07-30'
    # eventDate = params[:eventDate]

    # artist ids for event in array
    artistArr = getArtistIDs
    # artistArr = ['5FKchcZpQOkqFvXBj1aCvb']

    # create playlist using event name, date for name
    result = createPlaylist(event_name, event_date)
    puts 'playlist_id'
    pid = URI.parse(result)
    playlist_id = pid.path.split('/').last
    puts playlist_id
    
    # populate playlist based on artists top tracks
    access_token = ENV["ACCESS_TOKEN"]
    auth = {"Authorization": "Bearer #{access_token}"}

    artistArr.each do |artist|
      # puts 'artist'
      # puts artist
      #get top tracks
      tracks_response = RestClient.get("https://api.spotify.com/v1/artists/#{artist}/top-tracks?market=CA", headers=auth)

      top_tracks = JSON.parse(tracks_response)
      artistUris = []
      top_tracks['tracks'].each do |track|
        # puts track['name']
        # puts track['uri']

        artistUris.append(track['uri'])
      end
      # puts artistUris
      addTracksToPlaylist(artistUris, playlist_id)
    end
    render json: pid
  end

  def getArtistInfo
    access_token = ENV["ACCESS_TOKEN"]
    auth = {"Authorization": "Bearer #{access_token}"}

    puts auth
    # artist_name = 'Excision'

    artist_name = params[:data]

    endpoint1 = RestClient.get("https://api.spotify.com/v1/search?q=#{artist_name}&type=artist&limit=1", headers=auth)
    # endpoint1 = RestClient.get("https://api.spotify.com/v1/artists/#{artist_id}", headers=auth)

    data1 = JSON.parse(endpoint1)
    artistURI = data1["artists"]["items"]
    render json: artistURI
  end

  def getArtistIDs
    ## this artists var assignment needs to be fixed
    artists = Artist.joins("join gigs on gigs.artist_id = artists.id").where(gigs: {event_id: 206106}).select("artists.name ,spotify_artist_id")
    artistArr = []
    artists.each do |artist|
      artistArr.append(artist.spotify_artist_id)  
    end
    return artistArr
  end

  def top_tracks
    access_token = ENV["ACCESS_TOKEN"]
  
    auth = {"Authorization": "Bearer #{access_token}"}

    artist_name = params[:data]

    puts artist_name

    artist = Artist.find_by(name: "#{artist_name}")

    artist_id = artist.spotify_artist_id

    endpoint1 = RestClient.get("https://api.spotify.com/v1/artists/#{artist_id}/top-tracks?market=CA", headers=auth)

    data1 = JSON.parse(endpoint1)
    return data1
  end

end