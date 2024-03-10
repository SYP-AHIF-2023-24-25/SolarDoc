defmodule SolardocPhoenixWeb.UserSettingsController do
  use SolardocPhoenixWeb, :controller

  alias SolardocPhoenix.Accounts
  alias SolardocPhoenixWeb.UserAuth

  plug :assign_email_and_password_changesets

  action_fallback SolardocPhoenixWeb.FallbackController

  def edit(conn, _params) do
    render(conn, :edit)
  end

  def update(conn, %{"action" => "update_email"} = params) do
    %{"current_password" => password, "user" => user_params} = params
    user = conn.assigns.current_user

    with {:ok, applied_user} <- Accounts.apply_user_email(user, password, user_params) do
        Accounts.deliver_user_update_email_instructions(
          applied_user,
          user.email,
          &url(~p"/users/settings/confirm_email/#{&1}")
        )

        conn
        |> put_flash(
          :info,
          "A link to confirm your email change has been sent to the new address."
        )
        |> redirect(to: ~p"/users/settings")
    end
  end

  def update(conn, %{"action" => "update_password"} = params) do
    %{"current_password" => password, "user" => user_params} = params
    user = conn.assigns.current_user

    with {:ok, user} <- Accounts.update_user_password(user, password, user_params) do
        conn
        |> put_flash(:info, "Password updated successfully.")
        |> put_session(:user_return_to, ~p"/users/settings")
        |> UserAuth.log_in_user(user)
    end
  end

  def confirm_email(conn, %{"token" => token}) do
    with :ok <- Accounts.update_user_email(conn.assigns.current_user, token) do
        conn
        |> put_flash(:info, "Email changed successfully.")
        |> redirect(to: ~p"/users/settings")
    end
  end

  defp assign_email_and_password_changesets(conn, _opts) do
    user = conn.assigns.current_user

    conn
    |> assign(:email_changeset, Accounts.change_user_email(user))
    |> assign(:password_changeset, Accounts.change_user_password(user))
  end
end
