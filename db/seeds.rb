# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
require 'dotenv'
require 'json'
require 'rest-client'
Dotenv.load

def seed_events 
  api_key = ENV["EDMTRAIN_API_KEY"]

  url = "https://edmtrain.com/api/events?events?startDate=2022-07-&endDate=2022-08-25&livestreamInd=false&locationIds=5&festivalInd=true&client=#{api_key}"

  @response = RestClient::Request.execute(method: :get, url: url, verify_ssl: false)

  @events_info = JSON.parse(@response.body)

  @events_info["data"].map do |event|
    Event.create(id: event["id"], name: event["name"], date: event["date"], location: event["venue"]["location"])
    event["artistList"].map do |artist|
      Artist.create(id: artist["id"], name: artist["name"])
      Gig.create(event_id: event["id"], artist_id: artist["id"])
    end
  end

  Artist.find(258).update_attribute(:spotify_artist_id, '5FKchcZpQOkqFvXBj1aCvb')
  Artist.find(2274).update_attribute(:spotify_artist_id, '6t1gpxYbY8OlLA7D2RiikQ')
  Artist.find(9019).update_attribute(:spotify_artist_id, '67RWyN1fDOu7WuSTIi5hE7')
  Artist.find(77).update_attribute(:spotify_artist_id, '1UtBjqMZBAmqIPlDrKu7Tr')
  Artist.find(182).update_attribute(:spotify_artist_id, '6ySxYu68zTsO5ghsThpGtS')
  Artist.find(4817).update_attribute(:spotify_artist_id, '0Y0QSi6lz1bPik5Ffjr8sd')
  Artist.find(18051).update_attribute(:spotify_artist_id, '3PlRvQnVE3XAbtHUNc4nic')
  Artist.find(8054).update_attribute(:spotify_artist_id, '45lcbTsX07JWzmTIjcdyBz')
  Artist.find(16914).update_attribute(:spotify_artist_id, '78GHS9zWXcj8tBke222g5N')
  Artist.find(12682).update_attribute(:spotify_artist_id, '0bGDTQ78MVgI5Snqo9KJZw')
  Artist.find(7578).update_attribute(:spotify_artist_id, '1ic0FHNGIjXZAWH6O6Reif')
  Artist.find(773).update_attribute(:spotify_artist_id, '4L9PX6lwPWo2NeuXL9kyJK')
  Artist.find(10092).update_attribute(:spotify_artist_id, '5EmEZjq8eHEC6qFnT63Lza')
  Artist.find(261).update_attribute(:spotify_artist_id, '5FWi1mowu6uiU2ZHwr1rby')
  Artist.find(5689).update_attribute(:spotify_artist_id, '6mPZJXtFVaakznkRxdgWtC')
  Artist.find(9874).update_attribute(:spotify_artist_id, '24kY0bUku58QhWv5WFFXaf')
  Artist.find(6958).update_attribute(:spotify_artist_id, '1DzQInbDVhE9Lh5s6T0DUL')
  Artist.find(514).update_attribute(:spotify_artist_id, '4BTcOR2hEQZQQL5AMo5u10')
  Artist.find(11982).update_attribute(:spotify_artist_id, '007nYTXRhZJUZGH7ct5Y3v')
  Artist.find(35727).update_attribute(:spotify_artist_id, '7nZJ6x2Wj2suztg4H53GSf')
  Artist.find(36821).update_attribute(:spotify_artist_id, '5hXPnS34O3Kq3O8dkaE9FM')
  Artist.find(21054).update_attribute(:spotify_artist_id, '4IVi10Tw5s4iwiPUvh6DcF')
  Artist.find(10127).update_attribute(:spotify_artist_id, '2vvcM0Ac0BOQIFpBeRO9vu')
  Artist.find(83).update_attribute(:spotify_artist_id, '0SfsnGyD8FpIN4U4WCkBZ5')
  Artist.find(8140).update_attribute(:spotify_artist_id, '1VJ0briNOlXRtJUAzoUJdt')
  Artist.find(5541).update_attribute(:spotify_artist_id, '7w1eTNePApzDk8XtgykCPS')
  Artist.find(4135).update_attribute(:spotify_artist_id, '0EdsvtaOf72jQy9LoQ8QqF')
  Artist.find(8581).update_attribute(:spotify_artist_id, '1TRyeXs6NXHSFqoXHR1w5e')
  Artist.find(9978).update_attribute(:spotify_artist_id, '6eANYjiwIF3p73lhirhxGI')
  Artist.find(27086).update_attribute(:spotify_artist_id, '32B4m0OTNUKzhgYGCCvTZw')
  Artist.find(9038).update_attribute(:spotify_artist_id, '3c3aIUcvGaeRYmqRm9rXqb')

  # Foo.find(1).update_attribute(:myattribute, 'value')

end

seed_events()

# @event_artist_excision = Artist.find_by(id: 258)

# puts "HELLO"
# puts @event_artist_excision.name

# def seed_artist_spotify_id
#   access_token = ENV["ACCESS_TOKEN"]

#   auth = {"Authorization": "Bearer #{access_token}"}

 

#   endpoint1 = RestClient.get("https://api.spotify.com/v1/search?q=#{artist_name}&type=artist&limit=1", headers=auth)

#   data1 = JSON.parse(endpoint1)
#   render json: data1
# end