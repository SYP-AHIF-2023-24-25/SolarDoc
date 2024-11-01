defmodule SolardocPhoenix.Permissions do
  @moduledoc """
  The Permissions context.
  """

  import Ecto.Query, warn: false
  alias SolardocPhoenix.Repo

  alias SolardocPhoenix.Permissions.FilePermission

  @doc """
  Returns the list of file_permissions.

  ## Examples

      iex> list_file_permissions()
      [%FilePermission{}, ...]

  """
  def list_file_permissions do
    Repo.all(FilePermission)
  end

  @doc """
  Gets a single file_permission.

  Raises `Ecto.NoResultsError` if the File permission does not exist.

  ## Examples

      iex> get_file_permission!(123)
      %FilePermission{}

      iex> get_file_permission!(456)
      ** (Ecto.NoResultsError)

  """
  def get_file_permission!(id), do: Repo.get!(FilePermission, id)

  @doc """
  Gets a single file_permission for a specific user and file.

  Raises `Ecto.NoResultsError` if the File permission does not exist.

  ## Examples

      iex> get_file_permission_by_user_file!(123, 789)
      %FilePermission{}

      iex> get_file_permission_by_user_file!(456, 1011)
      ** (Ecto.NoResultsError)

  """
  def get_file_permission_by_user_file!(user_id, file_id) do
    Repo.get_by!(FilePermission, user_id: user_id, file_id: file_id)
  end

  @doc """
  Gets all file permissions for a specific file.

  Raises `Ecto.NoResultsError` if no file permissions exist.

  ## Examples

      iex> get_file_permissions_by_file!(123)
      [%FilePermission{}, ...]

      iex> get_file_permissions_by_file!(456)
      ** (Ecto.NoResultsError)

  """
  def get_file_permissions_by_file!(file_id) do
    query = from(fp in FilePermission, where: fp.file_id == ^file_id)

    case Repo.all(query) do
      [] -> raise Ecto.NoResultsError, "No file permissions found for file_id: #{file_id}"
      permissions -> permissions
    end
  end

  @doc """
  Creates a file_permission.

  ## Examples

      iex> create_file_permission(%{field: value})
      {:ok, %FilePermission{}}

      iex> create_file_permission(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_file_permission(attrs \\ %{}) do
    %FilePermission{}
    |> FilePermission.create_changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a file_permission.

  ## Examples

      iex> update_file_permission(file_permission, %{field: new_value})
      {:ok, %FilePermission{}}

      iex> update_file_permission(file_permission, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_file_permission(%FilePermission{} = file_permission, attrs) do
    file_permission
    |> FilePermission.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a file_permission.

  ## Examples

      iex> delete_file_permission(file_permission)
      {:ok, %FilePermission{}}

      iex> delete_file_permission(file_permission)
      {:error, %Ecto.Changeset{}}

  """
  def delete_file_permission(%FilePermission{} = file_permission) do
    Repo.delete(file_permission)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking file_permission changes.

  ## Examples

      iex> change_file_permission(file_permission)
      %Ecto.Changeset{data: %FilePermission{}}

  """
  def change_file_permission(%FilePermission{} = file_permission, attrs \\ %{}) do
    FilePermission.changeset(file_permission, attrs)
  end
end
