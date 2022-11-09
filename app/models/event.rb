class Event < ApplicationRecord
  has_many :gigs
  has_many :artists, :through => :gigs
end
