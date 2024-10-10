defmodule SolardocPhoenix.Files do
  @moduledoc """
  The Files context.
  """

  import Ecto.Query, warn: false
  alias SolardocPhoenix.Repo

  alias SolardocPhoenix.Files.File

  @doc """
  Returns the list of files.

  ## Examples

      iex> list_files()
      [%File{}, ...]

  """
  def list_files do
    Repo.all(File)
  end

  @doc """
  Gets a single file.

  Raises `Ecto.NoResultsError` if the File does not exist.

  ## Examples

      iex> get_file!(123)
      %File{}

      iex> get_file!(456)
      ** (Ecto.NoResultsError)

  """
  def get_file!(id), do: Repo.get!(File, id)

  @doc """
  Gets all files owned by a user.

  ## Examples

      iex> get_files_for_user(123)
      [%File{}, ...]

      iex> get_files_for_user(456)
      []
  """
  def get_files_for_user(user_id), do: Repo.all(from file in File, where: file.owner_id == ^user_id)

  @doc """
  Gets all global files.

  ## Examples

      iex> get_global_files()
      [%File{}, ...]
  """
  def get_global_files, do: Repo.all(from file in File, where: file.is_global == true)

  @doc """
  Creates a file.

  ## Examples

      iex> create_file(%{field: value})
      {:ok, %File{}}

      iex> create_file(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_file(attrs \\ %{}) do
    %File{}
    |> File.create_changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a file.

  ## Examples

      iex> update_file(file, %{field: new_value})
      {:ok, %File{}}

      iex> update_file(file, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_file(%File{} = file, attrs) do
    file
    |> File.update_changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a file.

  ## Examples

      iex> delete_file(file)
      {:ok, %File{}}

      iex> delete_file(file)
      {:error, %Ecto.Changeset{}}

  """
  def delete_file(%File{} = file) do
    Repo.delete(file)
  end
end
