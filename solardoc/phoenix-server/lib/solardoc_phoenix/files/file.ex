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
    |> cast(attrs, [:file_name, :last_edited, :created, :owner_id])
    |> validate_required([:file_name, :last_edited, :created, :owner_id])
  end

  @doc """
  A file changeset for creation.
  """

  def create_changeset(file, attrs, opts \\ []) do
    now = NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)
    file
    |> cast(attrs, [:file_name, :owner_id])
    |> foreign_key_constraint(:owner_id)
    |> change(created: now, last_edited: now)
  end

  @doc """
  A file changeset for updating.
  """
  def update_changeset(file, attrs) do
    now = NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)
    file
    |> change(last_edited: now,file_name: attrs.file_name)
  end
end
