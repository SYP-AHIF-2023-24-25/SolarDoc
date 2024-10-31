defmodule SolardocPhoenix.PermissionsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `SolardocPhoenix.Permissions` context.
  """

  @doc """
  Generate a file_permission.
  """
  def file_permission_fixture(attrs \\ %{}) do
    {:ok, file_permission} =
      attrs
      |> Enum.into(%{
        permission: 42
      })
      |> SolardocPhoenix.Permissions.create_file_permission()

    file_permission
  end
end
