defmodule SolardocPhoenix.Repo.Migrations.AddUniqueIndexForFileIdToEditorChannel do
  use Ecto.Migration

  def change do
    create index(:editor_channels, [:file_id])
  end
end
