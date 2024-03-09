defmodule SolardocPhoenixWeb.UserRegistrationJSON do
  alias SolardocPhoenix.Accounts.User

  @doc """
  Renders a single user.
  """
  def new(%{user: user}) do
    %{data: data(user)}
  end

  @doc """
  Renders a single user.
  """
  def edit(%{user: user}) do
    %{data: data(user)}
  end

  defp data(%User{} = user) do
    %{
      id: user.id
    }
  end
end
