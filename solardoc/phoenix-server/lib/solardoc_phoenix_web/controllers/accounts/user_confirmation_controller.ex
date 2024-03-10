defmodule SolardocPhoenixWeb.UserConfirmationController do
  use SolardocPhoenixWeb, :controller

  alias SolardocPhoenix.Accounts

  action_fallback SolardocPhoenixWeb.FallbackController

  def create(conn, %{"user" => %{"email" => email}}) do
    if user = Accounts.get_user_by_email(email) do
      Accounts.deliver_user_confirmation_instructions(
        user,
        &url(~p"/users/confirm/#{&1}")
      )
    end

    conn
    |> put_flash(
      :info,
      "If your email is in our system and it has not been confirmed yet, " <>
        "you will receive an email with instructions shortly."
    )
    |> redirect(to: ~p"/")
  end

  # Do not log in the user after confirmation to avoid a
  # leaked token giving the user access to the account.
  def update(conn, %{"token" => token}) do
    with {:ok, _} <- Accounts.confirm_user(token) do
        conn
        |> put_flash(:info, "User confirmed successfully.")
        |> redirect(to: ~p"/")
    end
  end
end
