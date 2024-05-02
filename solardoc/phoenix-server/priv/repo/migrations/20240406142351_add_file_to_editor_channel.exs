defmodule SolardocPhoenix.Repo.Migrations.AddFileToEditorChannel do
  use Ecto.Migration

  def change do
    alter table(:editor_channels) do
      add :file_id, references(:files, type: :uuid, on_delete: :delete_all), null: false
    end
  end
end
