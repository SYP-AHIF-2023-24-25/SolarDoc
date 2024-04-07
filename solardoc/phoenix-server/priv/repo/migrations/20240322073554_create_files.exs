defmodule SolardocPhoenix.Repo.Migrations.CreateFiles do
  use Ecto.Migration

  def change do
    create table(:files, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :file_name, :string
      add :owner_id, references(:users, type: :uuid, on_delete: :delete_all), null: false
      add :last_edited, :naive_datetime
      add :created, :naive_datetime

      timestamps(type: :utc_datetime)
    end
  end
end
