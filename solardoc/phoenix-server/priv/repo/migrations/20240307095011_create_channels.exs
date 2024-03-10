defmodule SolardocPhoenix.Repo.Migrations.CreateChannels do
  use Ecto.Migration

  def change do
    create table(:channels, primary_key: false) do
      add :id, :binary, primary_key: true
      add :name, :string
      add :description, :string
      add :activeSince, :date
      add :creator, :string

      timestamps(type: :utc_datetime)
    end
  end
end
