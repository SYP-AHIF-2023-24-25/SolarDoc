defmodule SolardocPhoenix.UpdateChannel.Channel do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, Ecto.UUID, autogenerate: true}
  schema "channels" do
    field :name, :string
    field :description, :string
    field :activeSince, :date
    field :creator, :string

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(channel, attrs) do
    channel
    |> cast(attrs, [:name, :description, :activeSince, :creator])
    |> validate_required([:name, :description, :activeSince, :creator])
  end
end
