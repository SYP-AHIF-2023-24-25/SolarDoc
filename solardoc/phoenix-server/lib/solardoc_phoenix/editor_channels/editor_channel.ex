defmodule SolardocPhoenix.EditorChannels.EditorChannel do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, Ecto.UUID, autogenerate: true}
  @foreign_key_type Ecto.UUID
  schema "editor_channels" do
    field :name, :string
    field :password, :string, virtual: true, redact: true
    field :hashed_password, :string, redact: true
    field :description, :string
    field :active_since, :naive_datetime
    belongs_to :creator, SolardocPhoenix.Accounts.User

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(channel, attrs) do
    channel
    |> cast(attrs, [:name, :description, :active_since, :creator])
    |> validate_required([:name, :description, :active_since, :creator])
  end

  @doc """
  A channel changeset for creation.

  This changeset is used to create a new channel, with the following validations:
  - Name, description and creator are present
  - Password is present and matches the given format

    ## Options

    * `:hash_password` - Hashes the password so it can be stored securely
      in the database and ensures the password field is cleared to prevent
      leaks in the logs. If password hashing is not needed and clearing the
      password field is not desired (like when using this changeset for
      validations on a LiveView form), this option can be set to `false`.
      Defaults to `true`.
  """
  def create_changeset(channel, attrs, opts \\ []) do
    now = NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)
    channel
    |> cast(attrs, [:name, :password, :description, :creator_id])
    |> validate_name()
    |> validate_password(opts)
    |> foreign_key_constraint(:creator_id)
    |> change(active_since: now)
  end

  defp validate_name(changeset) do
    changeset
    |> validate_required([:name])
    |> validate_length(:name, max: 40)
  end

  defp validate_password(changeset, opts) do
    changeset
    |> validate_required([:password])
    |> validate_length(:password, min: 10, max: 72)
    |> maybe_hash_password(opts)
  end

  defp maybe_hash_password(changeset, opts) do
    hash_password? = Keyword.get(opts, :hash_password, true) # Defaulting to hashing the password
    password = get_change(changeset, :password)

    if hash_password? && password && changeset.valid? do
      changeset
      # Hashing could be done with `Ecto.Changeset.prepare_changes/2`, but that
      # would keep the database transaction open longer and hurt performance.
      |> put_change(:hashed_password, Argon2.hash_pwd_salt(password))
      |> delete_change(:password)
    else
      changeset
    end
  end

  @doc """
  Verifies the password.

  If there is no channel or the channel doesn't have a password, we call
  `Argon2.no_user_verify/0` to avoid timing attacks.
  """
  def valid_password?(%SolardocPhoenix.EditorChannels.EditorChannel{hashed_password: hashed_password}, password)
      when is_binary(hashed_password) and byte_size(password) > 0 do
    Argon2.verify_pass(password, hashed_password)
  end

  def valid_password?(_, _) do
    Argon2.no_user_verify()
    false
  end

  @doc """
  Validates the current password otherwise adds an error to the changeset.
  """
  def validate_current_password(changeset, password) do
    if valid_password?(changeset.data, password) do
      changeset
    else
      add_error(changeset, :current_password, "is not valid")
    end
  end
end
