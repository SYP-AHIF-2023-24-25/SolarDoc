defmodule SolardocPhoenix.ShareFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `SolardocPhoenix.Share` context.
  """

  @doc """
  Generate a share_url.
  """
  def share_url_fixture(attrs \\ %{}) do
    {:ok, share_url} =
      attrs
      |> Enum.into(%{
        expired: true,
        expires_at: ~N[2024-03-21 07:45:00],
        file: "some file",
        issued_at: ~N[2024-03-21 07:45:00],
        perms: 42
      })
      |> SolardocPhoenix.Share.create_share_url()

    share_url
  end
end
