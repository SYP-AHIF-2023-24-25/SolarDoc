defmodule SolardocPhoenixWeb.UserJSON do
  alias SolardocPhoenix.Accounts.User

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
      id: user.id
    }
  end

  defp priv_data(%User{} = user) do
    %{
      id: user.id,
      email: user.email,
      confirmed_at: user.confirmed_at,
      role: user.role,
    }
  end
end
