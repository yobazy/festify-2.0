class CreatePlaylists < ActiveRecord::Migration[5.2]
  def change
    create_table :playlists do |t|
      t.string :name
      t.text :descriptor
      t.bigint :event_id
      t.references :events, index: true, foreign_key: true

      t.timestamps
    end
  end
end
