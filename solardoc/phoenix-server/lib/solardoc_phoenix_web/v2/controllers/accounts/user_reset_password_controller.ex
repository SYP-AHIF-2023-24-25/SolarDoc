defmodule SolardocPhoenixWeb.V2.UserResetPasswordController do
  use SolardocPhoenixWeb, :controller

  alias SolardocPhoenix.Accounts

  plug :get_user_by_reset_password_token when action in [:edit, :update]

  action_fallback SolardocPhoenixWeb.FallbackController

  @api_path SolardocPhoenixWeb.v2_api_path()

  def create(conn, %{"email" => email}) do
    if user = Accounts.get_user_by_email(email) do
      Accounts.deliver_user_reset_password_instructions(
        user,
        &url(~p"/users/reset_password/#{&1}")
      )
    end

    conn
    |> put_flash(
      :info,
      "If your email is in our system, you will receive instructions to reset your password shortly."
    )
    |> redirect(to: ~p"/")
  end

  # Do not log in the user after reset password to avoid a
  # leaked token giving the user access to the account.
  def update(conn, user_params) do
    with {:ok, _} <- Accounts.reset_user_password(conn.assigns.user, user_params) do
        conn
        |> put_flash(:info, "Password reset successfully.")
        |> redirect(to: ~p"/users/auth")
    end
  end

  defp get_user_by_reset_password_token(conn, _opts) do
    %{"token" => token} = conn.params

    with {:ok, user} <- Accounts.get_user_by_reset_password_token(token) do
        conn
        |> assign(:user, user)
        |> assign(:token, token)
    end
  end
end
