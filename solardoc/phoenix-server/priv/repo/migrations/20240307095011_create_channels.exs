defmodule SolardocPhoenix.Repo.Migrations.CreateChannels do
  use Ecto.Migration

  def change do
    create table(:editor_channels, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :name, :string
      add :description, :string
      add :active_since, :naive_datetime
      add :creator_id, references(:users, type: :uuid, on_delete: :delete_all), null: false

      timestamps(type: :utc_datetime)
    end
  end
end
