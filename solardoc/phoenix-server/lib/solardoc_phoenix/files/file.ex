defmodule SolardocPhoenix.Files.File do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, Ecto.UUID, autogenerate: true}
  @foreign_key_type Ecto.UUID
  schema "files" do
    field :created, :naive_datetime
    field :file_name, :string
    field :last_edited, :naive_datetime
    belongs_to :owner, SolardocPhoenix.Accounts.User

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(file, attrs) do
    file
    |> cast(attrs, [:file_name, :last_edited, :created, :owner])
    |> validate_required([:file_name, :last_edited, :created, :owner])
  end
end
