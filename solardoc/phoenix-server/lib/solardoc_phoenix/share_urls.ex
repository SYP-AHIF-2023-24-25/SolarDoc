defmodule SolardocPhoenix.ShareURLs do
  @moduledoc """
  The Share context.
  """

  import Ecto.Query, warn: false
  alias SolardocPhoenix.Repo

  alias SolardocPhoenix.ShareURLs.ShareURL

  @doc """
  Returns the list of share_urls.

  ## Examples

      iex> list_share_urls()
      [%ShareURL{}, ...]

  """
  def list_share_urls do
    Repo.all(ShareURL)
  end

  @doc """
  Gets a single share_url.

  Raises `Ecto.NoResultsError` if the Share url does not exist.

  ## Examples

      iex> get_share_url!(123)
      %ShareURL{}

      iex> get_share_url!(456)
      ** (Ecto.NoResultsError)

  """
  def get_share_url!(id), do: Repo.get!(ShareURL, id)

  @doc """
  Creates a share_url.

  ## Examples

      iex> create_share_url(%{field: value})
      {:ok, %ShareURL{}}

      iex> create_share_url(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_share_url(attrs \\ %{}) do
    %ShareURL{}
    |> ShareURL.create_changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a share_url.

  ## Examples

      iex> update_share_url(share_url, %{field: new_value})
      {:ok, %ShareURL{}}

      iex> update_share_url(share_url, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_share_url(%ShareURL{} = share_url, attrs) do
    share_url
    |> ShareURL.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a share_url.

  ## Examples

      iex> delete_share_url(share_url)
      {:ok, %ShareURL{}}

      iex> delete_share_url(share_url)
      {:error, %Ecto.Changeset{}}

  """
  def delete_share_url(%ShareURL{} = share_url) do
    Repo.delete(share_url)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking share_url changes.

  ## Examples

      iex> change_share_url(share_url)
      %Ecto.Changeset{data: %ShareURL{}}

  """
  def change_share_url(%ShareURL{} = share_url, attrs \\ %{}) do
    ShareURL.changeset(share_url, attrs)
  end
end
