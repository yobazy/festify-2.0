class Artist < ApplicationRecord
  has_many :gigs
  has_many :events, :through => :gigs
end
