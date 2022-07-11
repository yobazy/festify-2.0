class CreateArtists < ActiveRecord::Migration[5.2]
  def change
    create_table :artists do |t|
      t.bigint :edmtrain_artist_id
      t.string :name
      # t.string :genre
      # t.string :spotify_link

      t.timestamps
    end
  end
end
