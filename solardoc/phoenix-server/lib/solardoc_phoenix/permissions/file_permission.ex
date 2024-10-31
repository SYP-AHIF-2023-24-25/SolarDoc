defmodule SolardocPhoenix.Permissions.FilePermission do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, Ecto.UUID, autogenerate: true}
  @foreign_key_type Ecto.UUID
  schema "file_permissions" do
    field :permission, :integer
    belongs_to :file, SolardocPhoenix.Files.File
    belongs_to :user, SolardocPhoenix.Accounts.User

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(file_permission, attrs) do
    file_permission
    |> cast(attrs, [:permission, :file_id, :user_id])
    |> validate_required([:permission, :file_id, :user_id])
  end

  @doc """
  A file_permission changeset for creation.
  This changeset is used to create a new file_permission.
  """
  def create_changeset(file_permission, attrs) do
    file_permission
    |> cast(attrs, [:file_id, :user_id, :permission, ])
    |> validate_required([:file_id, :user_id, :permission])
    |> foreign_key_constraint(:file_id)
    |> foreign_key_constraint(:user_id)
      # 0: none, 1: read, 3: read/write (2 is excluded since only write is not possible)
    |> validate_inclusion(:perms, [0, 1, 3])
  end
end
