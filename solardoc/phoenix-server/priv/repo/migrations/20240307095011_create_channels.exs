defmodule SolardocPhoenix.Repo.Migrations.CreateChannels do
  use Ecto.Migration

  def change do
    create table(:channels, primary_key: false) do
      add :id, :binary, primary_key: true
      add :name, :string
      add :description, :string
      add :activeSince, :naive_datetime
      add :creator_id, references(:users, type: :uuid, on_delete: :delete_all), null: false

      timestamps(type: :utc_datetime)
    end
  end
end
