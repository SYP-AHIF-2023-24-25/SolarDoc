defmodule SolardocPhoenix.Repo.Migrations.MakeChannelAuthOptional do
  use Ecto.Migration

  def change do
    alter table(:editor_channels) do
      modify :hashed_password, :string, null: true
    end
  end
end
