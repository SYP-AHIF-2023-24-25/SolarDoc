defmodule SolardocPhoenix.Repo.Migrations.AddedAdditionalUserProperties do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :username, :string
      add :organisation, :string
      add :intended_use, :integer
    end
  end
end
