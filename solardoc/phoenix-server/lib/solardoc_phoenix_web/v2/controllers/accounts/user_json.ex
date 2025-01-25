defmodule SolardocPhoenixWeb.V2.UserJSON do
  alias SolardocPhoenix.Accounts.User
  alias SolardocPhoenix.Utils

  @doc """
  Renders a list of accounts. Only contains the publicly available data.
  """
  def index(%{accounts: accounts}) do
    for(user <- accounts, do: publ_data(user))
  end

  @doc """
  Renders a single user. Only contains the publicly available data.
  """
  def show_publ(%{user: user}) do
    publ_data(user)
  end

  @doc """
  Renders a single user which was just created.
  """
  def new(%{user: user}) do
    priv_data(user)
  end

  @doc """
  Renders the current user.
  """
  def show_priv(%{user: user}) do
    priv_data(user)
  end

  defp publ_data(%User{} = user) do
    %{
      id: user.id,
      username: user.username
    }
  end

  defp priv_data(%User{} = user) do
    %{
      id: user.id,
      username: user.username,
      email: user.email,
      confirmed_at: Utils.naive_datetime_to_unix_milliseconds(user.confirmed_at),
      role: user.role,
      organisation: user.organisation,
      intended_use: user.intended_use
    }
  end
end
