defmodule SolardocPhoenix.Repo.Migrations.AddChannelAuth do
  use Ecto.Migration

  def change do
    alter table(:editor_channels) do
      add :hashed_password, :string, null: false
    end
  end
end
