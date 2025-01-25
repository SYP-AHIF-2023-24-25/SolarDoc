defmodule SolardocPhoenix.Repo.Migrations.AddGlobalBitFiles do
  use Ecto.Migration

  def change do
    alter table(:files) do
      add :is_global, :boolean, default: false, null: false
    end
  end
end
