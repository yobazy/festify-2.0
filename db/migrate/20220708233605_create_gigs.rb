class CreateGigs < ActiveRecord::Migration[5.2]
  def change
    create_table :gigs, id:false do |t|
      t.belongs_to :event
      t.belongs_to :artist
      # t.bigint :event_id
      # t.bigint :artist_id
      # t.references :events, index: true, foreign_key: true
      # t.references :artists, index: true, foreign_key: true

      t.timestamps
    end
  end
end
