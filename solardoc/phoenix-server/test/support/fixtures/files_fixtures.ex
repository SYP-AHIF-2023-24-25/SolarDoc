defmodule SolardocPhoenix.FilesFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `SolardocPhoenix.Files` context.
  """

  @doc """
  Generate a file.
  """
  def file_fixture(attrs \\ %{}) do
    {:ok, file} =
      attrs
      |> Enum.into(%{
        created: ~N[2024-03-21 07:35:00],
        file_name: "some file_name",
        last_edited: ~N[2024-03-21 07:35:00]
      })
      |> SolardocPhoenix.Files.create_file()

    file
  end
end
