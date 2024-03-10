defmodule SolardocPhoenixWeb.UserRegistrationController do
  use SolardocPhoenixWeb, :controller

  alias SolardocPhoenix.Accounts
  alias SolardocPhoenix.Accounts.User

  action_fallback SolardocPhoenixWeb.FallbackController

  def new(conn, _params) do
    changeset = Accounts.change_user_registration(%User{})
    render(conn, :new, changeset: changeset)
  end

  def create(conn, %{"user" => user_params}) do
    with {:ok, user} <- Accounts.register_user(user_params) do
        {:ok, _} =
          Accounts.deliver_user_confirmation_instructions(
            user,
            &url(~p"/users/confirm/#{&1}")
          )

        # Return a success JSON response
        conn
        |> put_status(:created)
        |> json(
          Map.merge(
            %{ message: "Successfully created a new user.", },
            SolardocPhoenixWeb.UserAccountsJSON.new(%{user: user})
          )
        )
    end
  end
end
