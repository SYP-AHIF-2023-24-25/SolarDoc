defmodule SolardocPhoenix.Files.File do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, Ecto.UUID, autogenerate: true}
  @foreign_key_type Ecto.UUID
  schema "files" do
    field :created, :naive_datetime
    field :file_name, :string
    field :last_edited, :naive_datetime
    field :content, :string, default: ""
    belongs_to :owner, SolardocPhoenix.Accounts.User

    timestamps(type: :utc_datetime)
  end

  @doc false
  def create_changeset(file, attrs) do
    now = NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)
    file
    |> cast(attrs, [:file_name, :owner_id])
    |> validate_required([:file_name, :owner_id])
    |> validate_length(:file_name, min: 1, max: 40)
    |> unique_constraint(:file_name)
    |> foreign_key_constraint(:owner_id)
    |> change(created: now, last_edited: now)
  end

  @doc false
  def update_changeset(file, attrs) do
    now = NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)
    file
    |> cast(attrs, [:file_name, :content])
    |> unique_constraint([:file_name, :owner_id])
    |> validate_length(:file_name, min: 1, max: 40)
    |> change(last_edited: now)
  end

  @doc false
  def content_changeset(file, attrs) do
    now = NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)
    file
    |> cast(attrs, [:content])
    |> validate_required([:content])
    |> change(last_edited: now)
  end
end
