defmodule SolardocPhoenix.Repo.Migrations.CreateFilePermissions do
  use Ecto.Migration

  def change do
    create table(:file_permissions,primary_key: false) do
      add :id, :uuid, primary_key: true
      add :permission, :integer, null: false
      add :user_id, references(:users, type: :uuid, on_delete: :delete_all), null: false
      add :file_id, references(:files, type: :uuid, on_delete: :delete_all), null: false

      timestamps(type: :utc_datetime)
    end
  end
end
