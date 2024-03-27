defmodule SolardocPhoenix.Share.ShareURL do
  use Ecto.Schema
  import Ecto.Changeset

  schema "share_urls" do
    field :file, :uuid
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
end
