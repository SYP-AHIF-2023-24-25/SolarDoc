defmodule SolardocPhoenixWeb.UserSessionController do
  use SolardocPhoenixWeb, :controller

  alias SolardocPhoenix.Accounts
  alias SolardocPhoenixWeb.UserAuth

  action_fallback SolardocPhoenixWeb.FallbackController

  def create(conn, %{"user" => user_params}) do
    %{"email" => email, "password" => password} = user_params

    with {:ok, user} <- Accounts.get_user_by_email_and_password(email, password) do
      token = UserAuth.create_user_token(user)

      json(conn, %{
        message: "Successfully logged in.",
        token: token
      })
    end
  end

  def delete(conn, _params) do
    conn
    |> UserAuth.delete_user_token() # API Logout
    |> json(%{message: "Successfully logged out."})
  end
end
