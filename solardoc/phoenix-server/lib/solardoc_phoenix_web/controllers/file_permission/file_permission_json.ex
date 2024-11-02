defmodule SolardocPhoenixWeb.FilePermissionJSON do
  alias SolardocPhoenix.Permissions.FilePermission

  @doc """
  Renders a list of file_permissions.
  """
  def index(%{file_permissions: file_permissions}) do
    for(file_permission <- file_permissions, do: data(file_permission))
  end

  @doc """
  Renders a single file_permission.
  """
  def show(%{file_permission: file_permission}) do
    data(file_permission)
  end

  defp data(%FilePermission{} = file_permission) do
    %{
      id: file_permission.id,
      permission: file_permission.permission,
      user_id: file_permission.user_id,
      file_id: file_permission.file_id
    }
  end
end
