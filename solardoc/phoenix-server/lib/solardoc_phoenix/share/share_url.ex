defmodule SolardocPhoenix.Share.ShareURL do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, Ecto.UUID, autogenerate: true}
  @foreign_key_type Ecto.UUID
  schema "share_urls" do
    belongs_to :file, SolardocPhoenix.Files.File
    field :expired, :boolean, default: false
    field :issued_at, :naive_datetime
    field :perms, :integer
    field :expires_at, :naive_datetime

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(share_url, attrs) do
    share_url
    |> cast(attrs, [:file, :issued_at, :perms, :expires_at, :expired])
    |> validate_required([:file, :issued_at, :perms, :expires_at, :expired])
  end

  @doc """
  A share_url changeset for creation.
  This changeset is used to create a new share_url.
  """
  def create_changeset(share_url, attrs) do
    now = NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)
    share_url
    |> cast(attrs, [:file, :perms, :expired])
    |> validate_required([:file, :perms])
    |> foreign_key_constraint(:file_id)
    # 0: none, 1: read, 3: read/write (2 is excluded since only write is not possible)
    |> validate_inclusion(:perms, [0, 1, 3])
    |> change(expires_at: NaiveDateTime.add(now, 1, :year))
    |> change(issued_at: now)
    |> change(expired: false)
  end
end
