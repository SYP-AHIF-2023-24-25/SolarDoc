defmodule SolardocPhoenix.Repo.Migrations.AddChannelForeignKeyToFile do
  use Ecto.Migration

  def change do
    alter table(:files) do
      add :channel_id, references(:editor_channels, on_delete: :delete_all, type: :uuid)
    end

    create index(:files, [:channel_id])
  end
end
