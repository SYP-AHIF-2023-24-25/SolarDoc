defmodule SolardocPhoenix.Repo.Migrations.MakeFileNameRequired do
  use Ecto.Migration

  def change do
    alter table(:files) do
      modify :file_name, :string, null: false
    end
  end
end
