defmodule SolardocPhoenix.Repo.Migrations.RemoveDeleteCascadeForChannelIdInFile do
  use Ecto.Migration

  def change do
    alter table(:files) do
      modify :channel_id, references(:editor_channels, on_delete: {:nilify, [:channel_id]}, type: :uuid),
        from: references(:editor_channels, on_delete: :delete_all, type: :uuid)
    end
  end
end
