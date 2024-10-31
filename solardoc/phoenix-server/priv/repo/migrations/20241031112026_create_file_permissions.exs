defmodule SolardocPhoenix.Repo.Migrations.CreateFilePermissions do
  use Ecto.Migration

  def change do
    create table(:file_permissions) do
      add :permission, :integer

      timestamps(type: :utc_datetime)
    end
  end
end
