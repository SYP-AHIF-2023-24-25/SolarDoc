defmodule SolardocPhoenix.Files.File do
  @moduledoc false
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, Ecto.UUID, autogenerate: true}
  @foreign_key_type Ecto.UUID
  schema "files" do
    field :created, :naive_datetime
    field :file_name, :string
    field :last_edited, :naive_datetime
    field :content, :string, default: ""
    belongs_to :channel, SolardocPhoenix.EditorChannels.EditorChannel
    belongs_to :owner, SolardocPhoenix.Accounts.User

    timestamps(type: :utc_datetime)
  end

  @doc false
  def create_changeset(file, attrs) do
    now = NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)
    file
    |> cast(attrs, [:file_name, :owner_id, :content])
    |> validate_required([:file_name, :owner_id])
    |> validate_length(:file_name, min: 1, max: 40)
    |> unique_constraint([:file_name, :owner_id])
    |> foreign_key_constraint(:owner_id)
    |> change(created: now, last_edited: now)
  end

  @doc false
  def update_changeset(file, attrs) do
    now = NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)
    file
    |> cast(attrs, [:file_name, :content, :channel_id])
    |> unique_constraint([:file_name, :owner_id])
    |> unique_constraint(:channel_id)
    |> validate_length(:file_name, min: 1, max: 40)
    |> foreign_key_constraint(:channel_id)
    |> maybe_set_last_edited(now)
  end

  defp maybe_set_last_edited(changeset, now) do
    content = get_change(changeset, :content)
    if content do
      changeset
      |> change(last_edited: now)
    else
      changeset
    end
  end
end
