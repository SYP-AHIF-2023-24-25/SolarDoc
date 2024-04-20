defmodule SolardocPhoenix.Repo.Migrations.AddContentToFile do
  use Ecto.Migration

  def change do
    alter table(:files) do
      add :content, :string, null: false, default: ""
    end
  end
end
