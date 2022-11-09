class Gig < ApplicationRecord
  has_and_belongs_to_many :events
  has_and_belongs_to_many :artist
end
