class CreateGigs < ActiveRecord::Migration[5.2]
  def change
    create_table :gigs do |t|
      t.bigint :event_id
      t.bigint :artist_id
      t.references :events, index: true, foreign_key: true
      t.references :artists, index: true, foreign_key: true

      t.timestamps
    end
  end
end
