defmodule SolardocPhoenix.Repo.Migrations.RemoveFileContentLengthLimit do
  use Ecto.Migration

  def change do
    alter table(:files) do
      modify :content, :text
    end
  end
end
