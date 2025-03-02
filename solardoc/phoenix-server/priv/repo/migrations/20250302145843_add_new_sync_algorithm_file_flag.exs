defmodule SolardocPhoenix.Repo.Migrations.AddNewSyncAlgorithmFileFlag do
  use Ecto.Migration

  def change do
    alter table(:files) do
      add :new_sync_algorithm, :boolean, null: false, default: true
    end
  end
end
