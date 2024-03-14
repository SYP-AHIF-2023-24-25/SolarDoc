defmodule SolardocPhoenix.EditorChannels do
  @moduledoc """
  The UpdateChannel context.
  """
  import Ecto.Query, warn: false

  alias SolardocPhoenix.Repo
  alias SolardocPhoenix.EditorChannels.EditorChannel

  @doc """
  Returns the list of channels.

  ## Examples

      iex> list_channels()
      [%EditorChannel{}, ...]

  """
  def list_channels do
    Repo.all(EditorChannel)
  end

  @doc """
  Gets a single channel.

  Raises `Ecto.NoResultsError` if the EditorChannel does not exist.

  ## Examples

      iex> get_user!("2f3d4e5d-6c7b-8a9a-1b2c-3d4e5f6d7e8f")
      %EditorChannel{}

      iex> get_user!("01234567-89ab-cdef-0123-456789abcdef")
      ** (Ecto.NoResultsError)

  """
  def get_channel!(id), do: Repo.get!(EditorChannel, id)

  @doc """
  Creates a channel.

  ## Examples

      iex> create_channel(%{field: value})
      {:ok, %EditorChannel{}}

      iex> create_channel(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_channel(attrs \\ %{}) do
    %EditorChannel{}
    |> EditorChannel.create_changeset(attrs)
    |> Repo.insert()
  end

#  We don't implement update_channel/2 because it's not used in the application.
#
#  TODO! Implement this with a proper changeset, where you can then change the description and potentially the password.
#
#  @doc """
#  Updates a channel.
#
#  ## Examples
#
#      iex> update_channel(channel, %{field: new_value})
#      {:ok, %EditorChannel{}}
#
#      iex> update_channel(channel, %{field: bad_value})
#      {:error, %Ecto.Changeset{}}
#
#  """
#  def update_channel(%EditorChannel{} = channel, attrs) do
#    channel
#    |> EditorChannel.changeset(attrs)
#    |> Repo.update()
#  end

  @doc """
  Deletes a channel.

  ## Examples

      iex> delete_channel(channel)
      {:ok, %EditorChannel{}}

      iex> delete_channel(channel)
      {:error, %Ecto.Changeset{}}

  """
  def delete_channel(%EditorChannel{} = channel) do
    Repo.delete(channel)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking channel changes.

  ## Examples

      iex> change_channel(channel)
      %Ecto.Changeset{data: %EditorChannel{}}

  """
  def change_channel(%EditorChannel{} = channel, attrs \\ %{}) do
    EditorChannel.changeset(channel, attrs)
  end

  alias SolardocPhoenix.EditorChannels.EditorChannel

  @doc """
  Returns the list of editor_channels.

  ## Examples

      iex> list_editor_channels()
      [%EditorChannel{}, ...]

  """
  def list_editor_channels do
    Repo.all(EditorChannel)
    |> Repo.preload(:creator)
  end

  @doc """
  Gets a single editor_channel.

  Raises `Ecto.NoResultsError` if the Editor channel does not exist.

  ## Examples

      iex> get_editor_channel!(123)
      %EditorChannel{}

      iex> get_editor_channel!(456)
      ** (Ecto.NoResultsError)

  """
  def get_editor_channel!(id), do: Repo.get!(EditorChannel, id)

  @doc """
  Creates a editor_channel.

  ## Examples

      iex> create_editor_channel(%{field: value})
      {:ok, %EditorChannel{}}

      iex> create_editor_channel(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_editor_channel(attrs \\ %{}) do
    %EditorChannel{}
    |> EditorChannel.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a editor_channel.

  ## Examples

      iex> update_editor_channel(editor_channel, %{field: new_value})
      {:ok, %EditorChannel{}}

      iex> update_editor_channel(editor_channel, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_editor_channel(%EditorChannel{} = editor_channel, attrs) do
    editor_channel
    |> EditorChannel.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a editor_channel.

  ## Examples

      iex> delete_editor_channel(editor_channel)
      {:ok, %EditorChannel{}}

      iex> delete_editor_channel(editor_channel)
      {:error, %Ecto.Changeset{}}

  """
  def delete_editor_channel(%EditorChannel{} = editor_channel) do
    Repo.delete(editor_channel)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking editor_channel changes.

  ## Examples

      iex> change_editor_channel(editor_channel)
      %Ecto.Changeset{data: %EditorChannel{}}

  """
  def change_editor_channel(%EditorChannel{} = editor_channel, attrs \\ %{}) do
    EditorChannel.changeset(editor_channel, attrs)
  end
end
