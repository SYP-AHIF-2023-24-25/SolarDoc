defmodule SolardocPhoenix.Repo.Migrations.AddUniqueIndexForFileName do
  use Ecto.Migration

  def change do
    create unique_index(:files, [:file_name, :owner_id])
  end
end
