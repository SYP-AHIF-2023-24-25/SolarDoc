defmodule SolardocPhoenix.Repo.Migrations.CreateShareUrls do
  use Ecto.Migration

  def change do
    create table(:share_urls, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :file_id, references(:files, type: :uuid, on_delete: :delete_all), null: false
      add :issued_at, :naive_datetime
      add :perms, :integer
      add :expires_at, :naive_datetime
      add :expired, :boolean, default: false, null: false

      timestamps(type: :utc_datetime)
    end
  end
end
